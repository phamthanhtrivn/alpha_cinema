package com.movieticket.ai.dto;

import java.util.List;

public record ChatResponse(
        String conversationId,
        String answer,
        List<CitationResponse> citations
) {
}
