package com.movieticket.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record KnowledgeIngestRequest(
        @NotBlank String title,
        @NotBlank String content,
        String sourceUrl,
        String metadata
) {
}
