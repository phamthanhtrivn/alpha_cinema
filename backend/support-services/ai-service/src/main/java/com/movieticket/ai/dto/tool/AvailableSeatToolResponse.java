package com.movieticket.ai.dto.tool;

import java.math.BigDecimal;

public record AvailableSeatToolResponse(
        String seatId,
        String seatCode,
        String seatType,
        BigDecimal price,
        Boolean available
) {
}
