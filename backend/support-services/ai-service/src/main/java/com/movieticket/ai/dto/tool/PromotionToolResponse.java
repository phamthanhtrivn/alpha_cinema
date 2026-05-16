package com.movieticket.ai.dto.tool;

import java.time.LocalDateTime;

public record PromotionToolResponse(
        String promotionId,
        String code,
        Integer discountPercent,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Integer remainingQuantity
) {
}
