package com.movieticket.ai.dto.tool;

import java.util.List;

public record MovieRecommendationResultToolResponse(
        List<MovieRecommendationToolResponse> recommendations,
        List<String> requestedGenres,
        String appliedGenreMatchMode,
        String resultReleaseStatus,
        boolean upcomingFallback,
        boolean genreMatchRelaxed,
        boolean needsClarification,
        String message
) {
}
