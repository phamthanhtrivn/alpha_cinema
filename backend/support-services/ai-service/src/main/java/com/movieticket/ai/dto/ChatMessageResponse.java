package com.movieticket.ai.dto;

import com.movieticket.ai.model.ChatRole;

import java.time.Instant;

public record ChatMessageResponse(
        Long id,
        ChatRole role,
        String content,
        Instant createdAt
) {
}
