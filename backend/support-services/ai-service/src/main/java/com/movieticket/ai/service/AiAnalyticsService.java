package com.movieticket.ai.service;

import com.movieticket.ai.dto.response.AiDashboardResponse;
import com.movieticket.ai.dto.response.PopularQuestionResponse;
import com.movieticket.ai.enums.ChatRole;
import com.movieticket.ai.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AiAnalyticsService {

    private static final ZoneId DASHBOARD_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM");
    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("MM/yyyy");

    private final JdbcTemplate jdbcTemplate;
    private final ChatMessageRepository chatMessageRepository;

    public List<PopularQuestionResponse> getPopularQuestions(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        return chatMessageRepository.findPopularQuestions(ChatRole.USER, PageRequest.of(0, safeLimit));
    }

    public AiDashboardResponse getDashboard(String range, Integer year, Integer month, Integer week) {
        TimeBounds bounds = resolveBounds(range, year, month, week);
        long totalConversations = countConversations(bounds);
        long totalUserQuestions = countMessages(ChatRole.USER, bounds);
        long totalAssistantAnswers = countMessages(ChatRole.ASSISTANT, bounds);
        long guestConversations = countConversationsByGuest(true, bounds);
        long memberConversations = countConversationsByGuest(false, bounds);
        double averageMessagesPerConversation = averageMessagesPerConversation(bounds);
        double successRate = totalUserQuestions == 0
                ? 0
                : Math.round((Math.min(totalAssistantAnswers, totalUserQuestions) * 1000.0 / totalUserQuestions)) / 10.0;

        return new AiDashboardResponse(
                totalConversations,
                totalUserQuestions,
                totalAssistantAnswers,
                averageMessagesPerConversation,
                guestConversations,
                memberConversations,
                getPopularQuestions(10),
                questionTrend(bounds),
                recentQuestions(bounds),
                recentConversations(bounds),
                totalConversations,
                successRate
        );
    }

    private long countMessages(ChatRole role, TimeBounds bounds) {
        QueryParts query = withMessageBounds("""
                SELECT COUNT(*)
                FROM ai_chat_messages
                WHERE role = ?
                  AND TRIM(content) <> ''
                """, bounds, role.name());
        Long count = jdbcTemplate.queryForObject(query.sql(), Long.class, query.params().toArray());
        return Objects.requireNonNullElse(count, 0L);
    }

    private long countConversations(TimeBounds bounds) {
        QueryParts query = withConversationBounds("""
                SELECT COUNT(*)
                FROM ai_chat_conversations
                WHERE 1 = 1
                """, bounds);
        Long count = jdbcTemplate.queryForObject(query.sql(), Long.class, query.params().toArray());
        return Objects.requireNonNullElse(count, 0L);
    }

    private long countConversationsByGuest(boolean guest, TimeBounds bounds) {
        QueryParts query = withConversationBounds("""
                SELECT COUNT(*)
                FROM ai_chat_conversations
                WHERE %s
                """.formatted(guest ? "(customer_id IS NULL OR TRIM(customer_id) = '')" : "(customer_id IS NOT NULL AND TRIM(customer_id) <> '')"), bounds);
        Long count = jdbcTemplate.queryForObject(query.sql(), Long.class, query.params().toArray());
        return Objects.requireNonNullElse(count, 0L);
    }

    private double averageMessagesPerConversation(TimeBounds bounds) {
        QueryParts query = withConversationBounds("""
                SELECT COALESCE(AVG(message_count), 0)
                FROM ai_chat_conversations
                WHERE 1 = 1
                """, bounds);
        Double average = jdbcTemplate.queryForObject(query.sql(), Double.class, query.params().toArray());
        return Math.round(Objects.requireNonNullElse(average, 0.0) * 10.0) / 10.0;
    }

    private List<AiDashboardResponse.QuestionTrendPoint> questionTrend(TimeBounds bounds) {
        String granularity = "year".equals(bounds.range()) || "all-time".equals(bounds.range()) ? "month" : "day";
        QueryParts query = withMessageBounds("""
                SELECT date_trunc('%s', created_at) AS period_start, COUNT(*) AS questions
                FROM ai_chat_messages
                WHERE role = ?
                  AND TRIM(content) <> ''
                """.formatted(granularity), bounds, ChatRole.USER.name());
        String sql = query.sql() + " GROUP BY period_start ORDER BY period_start ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Instant instant = rs.getTimestamp("period_start").toInstant();
            LocalDate date = LocalDateTime.ofInstant(instant, DASHBOARD_ZONE).toLocalDate();
            String label = "month".equals(granularity)
                    ? date.format(MONTH_LABEL)
                    : date.format(DAY_LABEL);
            return new AiDashboardResponse.QuestionTrendPoint(label, rs.getLong("questions"));
        }, query.params().toArray());
    }

    private List<AiDashboardResponse.RecentQuestion> recentQuestions(TimeBounds bounds) {
        QueryParts query = withMessageBounds("""
                SELECT id, conversation_id, TRIM(content) AS question, created_at
                FROM ai_chat_messages
                WHERE role = ?
                  AND TRIM(content) <> ''
                """, bounds, ChatRole.USER.name());
        String sql = query.sql() + " ORDER BY created_at DESC LIMIT 8";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new AiDashboardResponse.RecentQuestion(
                rs.getLong("id"),
                rs.getString("conversation_id"),
                rs.getString("question"),
                toIsoString(rs.getTimestamp("created_at"))
        ), query.params().toArray());
    }

    private List<AiDashboardResponse.RecentConversation> recentConversations(TimeBounds bounds) {
        QueryParts query = withConversationBounds("""
                SELECT id, customer_id, customer_name, message_count, created_at, archived_at
                FROM ai_chat_conversations
                WHERE 1 = 1
                """, bounds);
        String sql = query.sql() + " ORDER BY archived_at DESC LIMIT 8";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String customerId = rs.getString("customer_id");
            boolean guest = customerId == null || customerId.isBlank();
            String customerName = rs.getString("customer_name");
            return new AiDashboardResponse.RecentConversation(
                    rs.getString("id"),
                    customerName == null || customerName.isBlank() ? (guest ? "Guest" : customerId) : customerName,
                    guest,
                    rs.getInt("message_count"),
                    toIsoString(rs.getTimestamp("created_at")),
                    toIsoString(rs.getTimestamp("archived_at"))
            );
        }, query.params().toArray());
    }

    private QueryParts withMessageBounds(String baseSql, TimeBounds bounds, Object... initialParams) {
        List<Object> params = new ArrayList<>(List.of(initialParams));
        StringBuilder sql = new StringBuilder(baseSql);
        appendBounds(sql, params, "created_at", bounds);
        return new QueryParts(sql.toString(), params);
    }

    private QueryParts withConversationBounds(String baseSql, TimeBounds bounds, Object... initialParams) {
        List<Object> params = new ArrayList<>(List.of(initialParams));
        StringBuilder sql = new StringBuilder(baseSql);
        appendBounds(sql, params, "archived_at", bounds);
        return new QueryParts(sql.toString(), params);
    }

    private void appendBounds(StringBuilder sql, List<Object> params, String column, TimeBounds bounds) {
        if (bounds.start() != null) {
            sql.append(" AND ").append(column).append(" >= ?\n");
            params.add(Timestamp.from(bounds.start()));
        }
        if (bounds.end() != null) {
            sql.append(" AND ").append(column).append(" < ?\n");
            params.add(Timestamp.from(bounds.end()));
        }
    }

    private TimeBounds resolveBounds(String range, Integer year, Integer month, Integer week) {
        LocalDateTime now = LocalDateTime.now(DASHBOARD_ZONE);
        String safeRange = range == null || range.isBlank() ? "month" : range;
        if ("all-time".equals(safeRange)) {
            return new TimeBounds(safeRange, null, null);
        }

        int safeYear = Objects.requireNonNullElse(year, now.getYear());
        if ("year".equals(safeRange)) {
            LocalDateTime start = LocalDateTime.of(safeYear, 1, 1, 0, 0);
            return new TimeBounds(safeRange, toInstant(start), toInstant(start.plusYears(1)));
        }

        int safeMonth = Math.max(1, Math.min(12, Objects.requireNonNullElse(month, now.getMonthValue())));
        YearMonth yearMonth = YearMonth.of(safeYear, safeMonth);
        if ("week".equals(safeRange)) {
            int safeWeek = Math.max(1, Math.min(5, Objects.requireNonNullElse(week, currentWeekOfMonth(now))));
            LocalDateTime start = yearMonth.atDay(1).atStartOfDay().plusDays((long) (safeWeek - 1) * 7);
            LocalDateTime end = start.plusDays(7);
            LocalDateTime monthEnd = yearMonth.atEndOfMonth().atTime(23, 59, 59).plusSeconds(1);
            return new TimeBounds(safeRange, toInstant(start), toInstant(end.isAfter(monthEnd) ? monthEnd : end));
        }

        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        return new TimeBounds("month", toInstant(start), toInstant(start.plusMonths(1)));
    }

    private Instant toInstant(LocalDateTime value) {
        return value.atZone(DASHBOARD_ZONE).toInstant();
    }

    private int currentWeekOfMonth(LocalDateTime value) {
        return (int) Math.ceil(value.getDayOfMonth() / 7.0);
    }

    private String toIsoString(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().toString();
    }

    private record TimeBounds(String range, Instant start, Instant end) {
    }

    private record QueryParts(String sql, List<Object> params) {
    }
}
