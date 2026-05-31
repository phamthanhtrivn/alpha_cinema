package com.movieticket.ai.dto.tool;

public record ProductToolResponse(
        String productId,
        String productName,
        Double unitPrice,
        String description,
        String productType,
        String pictureUrl
) {
}
