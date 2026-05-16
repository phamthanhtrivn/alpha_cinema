package com.movieticket.ai.dto.tool;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ShowtimeToolResponse(
        String showScheduleId,
        String movieName,
        String cinemaName,
        String cinemaId,
        String roomName,
        String projectionType,
        String translationType,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Integer availableSeatCount,
        BigDecimal minPrice
) {
}
