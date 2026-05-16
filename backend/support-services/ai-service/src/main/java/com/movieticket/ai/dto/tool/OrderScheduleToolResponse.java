package com.movieticket.ai.dto.tool;

import java.time.LocalDateTime;

public record OrderScheduleToolResponse(
        String showScheduleId,
        String movieId,
        String movieName,
        String movieThumbnailUrl,
        String ageRating,
        String cinemaId,
        String roomId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String projectionType,
        String translationType
) {
}
