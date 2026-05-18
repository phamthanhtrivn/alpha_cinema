package com.movieticket.ai.dto.tool;

import java.math.BigDecimal;

public record OrderSeatToolResponse(
        String seatId,
        String seatCode,
        String roomId,
        String seatTypeId,
        BigDecimal unitPrice
) {
}
