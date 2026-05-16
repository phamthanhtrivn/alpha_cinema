package com.movieticket.ai.dto.tool;

public record MovieToolResponse(
        String movieId,
        String movieName,
        String genre,
        Integer durationMinutes,
        String ageRating,
        String status
) {
}
