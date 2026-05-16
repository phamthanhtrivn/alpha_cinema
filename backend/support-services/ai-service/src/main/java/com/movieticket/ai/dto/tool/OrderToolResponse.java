package com.movieticket.ai.dto.tool;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderToolResponse(
        String orderId,
        String orderCode,
        String movieName,
        String cinemaName,
        LocalDateTime showTime,
        String status,
        BigDecimal totalAmount,
        LocalDateTime createdAt
) {
}
