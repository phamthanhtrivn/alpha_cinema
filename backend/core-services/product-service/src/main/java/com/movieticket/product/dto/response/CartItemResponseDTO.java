package com.movieticket.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDTO {
    private String productId;
    private String name;
    private double unitPrice;
    private String pictureUrl;
    private int quantity;
}
