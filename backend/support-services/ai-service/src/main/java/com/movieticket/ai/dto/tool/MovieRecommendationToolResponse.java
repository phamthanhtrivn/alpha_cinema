package com.movieticket.ai.dto.tool;

import java.time.LocalDate;
import java.util.List;

public record MovieRecommendationToolResponse(
        String movieId,
        String movieName,
        String ageRating,
        Double avgRating,
        LocalDate premiereDate,
        String thumbnailUrl,
        String bannerUrl,
        String releaseStatus,
        Integer matchedShowtimeCount,
        List<ShowtimeToolResponse> sampleShowtimes
) {
}
