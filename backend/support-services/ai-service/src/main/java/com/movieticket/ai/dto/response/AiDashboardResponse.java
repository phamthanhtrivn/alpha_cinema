package com.movieticket.ai.dto.response;

import java.util.List;

public record AiDashboardResponse(
        long totalConversations,
        long totalUserQuestions,
        long totalAssistantAnswers,
        double averageMessagesPerConversation,
        long guestConversations,
        long memberConversations,
        List<PopularQuestionResponse> popularQuestions,
        List<QuestionTrendPoint> questionTrend,
        List<RecentQuestion> recentQuestions,
        List<RecentConversation> recentConversations,
        long totalChats,
        double successRate
) {
    public record QuestionTrendPoint(String label, long questions) {
    }

    public record RecentQuestion(
            Long id,
            String conversationId,
            String question,
            String createdAt
    ) {
    }

    public record RecentConversation(
            String id,
            String customerName,
            boolean guest,
            int messageCount,
            String createdAt,
            String archivedAt
    ) {
    }
}
