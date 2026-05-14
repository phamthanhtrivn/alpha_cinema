package com.movieticket.product.service;

import com.movieticket.product.entity.Movie;
import com.movieticket.product.entity.ShowSchedule;
import com.movieticket.product.enums.ReleaseStatus;
import com.movieticket.product.repository.MovieRepository;
import com.movieticket.product.repository.ShowScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProductDashboardAnalyticsService {
    private final MovieRepository movieRepository;
    private final ShowScheduleRepository showScheduleRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String range, Integer year, Integer month, Integer week, String cinemaId) {
        LocalDateTime[] bounds = resolveBounds(range, year, month, week);
        List<Movie> movies = movieRepository.findAll();
        List<ShowSchedule> schedules = showScheduleRepository.findAll().stream()
                .filter(schedule -> cinemaId == null || cinemaId.isBlank() || cinemaId.equals(schedule.getCinemaId()))
                .filter(schedule -> isInRange(schedule.getStartTime(), bounds))
                .sorted(Comparator.comparing(ShowSchedule::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        return row(
                "movies", movies(movies),
                "schedules", schedules(schedules)
        );
    }

    private Map<String, Object> movies(List<Movie> movies) {
        long nowShowing = movies.stream().filter(movie -> movie.getReleaseStatus() == ReleaseStatus.NOW_SHOWING).count();
        long comingSoon = movies.stream().filter(movie -> movie.getReleaseStatus() == ReleaseStatus.UPCOMING).count();

        return row(
                "topRevenue", List.of(),
                "topTickets", List.of(),
                "lookup", movies.stream()
                        .map(movie -> row("id", movie.getId(), "title", movie.getTitle()))
                        .toList(),
                "nowShowing", nowShowing,
                "comingSoon", comingSoon
        );
    }

    private List<Map<String, Object>> schedules(List<ShowSchedule> schedules) {
        return schedules.stream()
                .limit(12)
                .map(schedule -> row(
                        "id", schedule.getId(),
                        "movieId", schedule.getMovie() == null ? null : schedule.getMovie().getId(),
                        "cinemaId", schedule.getCinemaId(),
                        "movieTitle", schedule.getMovie() == null ? schedule.getId() : schedule.getMovie().getTitle(),
                        "cinemaName", schedule.getCinemaId(),
                        "roomName", schedule.getRoomId(),
                        "startTime", schedule.getStartTime(),
                        "endTime", schedule.getEndTime(),
                        "status", schedule.isStatus() ? "ON_SALE" : "ENDED",
                        "soldSeats", 0,
                        "totalSeats", schedule.getAvailableSeat()
                ))
                .toList();
    }

    private boolean isInRange(LocalDateTime value, LocalDateTime[] bounds) {
        if (value == null || bounds == null) {
            return true;
        }
        return !value.isBefore(bounds[0]) && value.isBefore(bounds[1]);
    }

    private LocalDateTime[] resolveBounds(String range, Integer year, Integer month, Integer week) {
        LocalDateTime now = LocalDateTime.now();
        if ("all-time".equals(range)) {
            return null;
        }

        int safeYear = Objects.requireNonNullElse(year, now.getYear());
        if ("year".equals(range)) {
            LocalDateTime start = LocalDateTime.of(safeYear, 1, 1, 0, 0);
            return new LocalDateTime[]{start, start.plusYears(1)};
        }

        int safeMonth = Math.max(1, Math.min(12, Objects.requireNonNullElse(month, now.getMonthValue())));
        YearMonth yearMonth = YearMonth.of(safeYear, safeMonth);
        if ("month".equals(range)) {
            LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
            return new LocalDateTime[]{start, start.plusMonths(1)};
        }

        int safeWeek = Math.max(1, Math.min(5, Objects.requireNonNullElse(week, currentWeekOfMonth(now))));
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay().plusDays((long) (safeWeek - 1) * 7);
        LocalDateTime end = start.plusDays(7);
        LocalDateTime monthEnd = yearMonth.atEndOfMonth().atTime(23, 59, 59).plusSeconds(1);
        return new LocalDateTime[]{start, end.isAfter(monthEnd) ? monthEnd : end};
    }

    private Map<String, Object> row(Object... pairs) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int index = 0; index < pairs.length - 1; index += 2) {
            map.put(String.valueOf(pairs[index]), pairs[index + 1]);
        }
        return map;
    }

    private int currentWeekOfMonth(LocalDateTime value) {
        return (int) Math.ceil(value.getDayOfMonth() / 7.0);
    }
}
