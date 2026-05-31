package com.movieticket.ai.dto.response;

public record ChatActionResponse(
        String type,
        String label,
        String url,
        String movieId,
        String showScheduleId,
        String description
) {
}
