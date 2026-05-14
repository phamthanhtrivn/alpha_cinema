package com.movieticket.ai.dto;

public record KnowledgeResponse(
        Long id,
        String title,
        String sourceUrl,
        String content,
        String metadata,
        double score
) {
}
