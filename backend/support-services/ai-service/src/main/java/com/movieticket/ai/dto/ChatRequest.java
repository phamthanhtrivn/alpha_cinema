package com.movieticket.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        String conversationId,
        @NotBlank(message = "Message is required") String message
) {
}
