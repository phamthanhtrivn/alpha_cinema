package com.movieticket.ai.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChatResponse {
    private String conversationId;
    private String answer;
    private List<CitationResponse> citations;
    private boolean shouldStartNewConversation;
    private Integer conversationMessageCount;
}
