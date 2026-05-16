package com.movieticket.ai.dto.tool;

import java.math.BigDecimal;

public record OrderProductToolResponse(
        String productId,
        String productName,
        Integer quantity,
        String pictureUrl,
        BigDecimal unitPrice
) {
}
