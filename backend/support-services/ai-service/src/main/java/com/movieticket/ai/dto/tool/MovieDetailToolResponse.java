package com.movieticket.ai.dto.tool;

import java.time.LocalDate;
import java.util.List;

public record MovieDetailToolResponse(
        String movieId,
        String movieName,
        Integer durationMinutes,
        Double avgRating,
        LocalDate premiereDate,
        String producer,
        String description,
        String trailerUrl,
        String thumbnailUrl,
        String bannerUrl,
        String ageRating,
        Integer releaseYear,
        String nationality,
        List<String> genres,
        List<String> actors,
        List<String> directors
) {
}
