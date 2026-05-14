package com.movieticket.ai.dto;

public record CitationResponse(
        Long id,
        String title,
        String sourceUrl,
        double score
) {
}
