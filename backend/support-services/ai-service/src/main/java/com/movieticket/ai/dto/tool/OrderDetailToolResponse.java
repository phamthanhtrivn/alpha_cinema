package com.movieticket.ai.dto.tool;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDetailToolResponse(
        String orderId,
        LocalDateTime createdAt,
        String status,
        BigDecimal totalPrice,
        BigDecimal totalPayment,
        BigDecimal pointDiscount,
        BigDecimal promotionDiscount,
        String promotionCode,
        String qrCode,
        String cinemaName,
        String roomNumber,
        OrderScheduleToolResponse showSchedule,
        List<OrderSeatToolResponse> seats,
        List<OrderProductToolResponse> products
) {
}
