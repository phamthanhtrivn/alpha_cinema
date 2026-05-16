package com.movieticket.ai.dto.tool;

import java.time.LocalDate;

public record MovieSearchToolResponse(
        String movieId,
        String movieName,
        String ageRating,
        Double avgRating,
        LocalDate premiereDate,
        String trailerUrl,
        String thumbnailUrl,
        String bannerUrl,
        String status
) {
}
