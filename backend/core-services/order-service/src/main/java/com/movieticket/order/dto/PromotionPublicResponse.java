package com.movieticket.order.dto;

import java.time.LocalDateTime;

public record PromotionPublicResponse(
        String id,
        String code,
        Integer discountPercent,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Integer remainingQuantity
) {
}
