package com.movieticket.ai.dto.response;

public record PolicyResponse(
        String id,
        String title,
        String topic,
        String source,
        String content,
        boolean active,
        int chunkCount,
        String createdAt,
        String updatedAt
) {
}
