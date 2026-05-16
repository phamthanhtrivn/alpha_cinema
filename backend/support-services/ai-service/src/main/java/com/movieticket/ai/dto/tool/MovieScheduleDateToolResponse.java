package com.movieticket.ai.dto.tool;

import java.time.LocalDate;
import java.util.List;

public record MovieScheduleDateToolResponse(
        String movieId,
        String movieName,
        List<LocalDate> availableDates
) {
}
