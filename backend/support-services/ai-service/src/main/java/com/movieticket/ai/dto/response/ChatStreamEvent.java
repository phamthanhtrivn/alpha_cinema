package com.movieticket.ai.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChatStreamEvent {
    private String type;
    private String conversationId;
    private String delta;
    private String message;
    private List<CitationResponse> citations;
    private List<ChatActionResponse> actions;
    private Boolean shouldStartNewConversation;
    private Integer conversationMessageCount;

    public static ChatStreamEvent meta(String conversationId, List<CitationResponse> citations) {
        return ChatStreamEvent.builder()
                .type("meta")
                .conversationId(conversationId)
                .citations(citations)
                .build();
    }

    public static ChatStreamEvent delta(String delta) {
        return ChatStreamEvent.builder()
                .type("delta")
                .delta(delta)
                .build();
    }

    public static ChatStreamEvent done(
            boolean shouldStartNewConversation,
            int conversationMessageCount,
            List<ChatActionResponse> actions
    ) {
        return ChatStreamEvent.builder()
                .type("done")
                .shouldStartNewConversation(shouldStartNewConversation)
                .conversationMessageCount(conversationMessageCount)
                .actions(actions)
                .build();
    }

    public static ChatStreamEvent error(String message) {
        return ChatStreamEvent.builder()
                .type("error")
                .message(message)
                .build();
    }
}
