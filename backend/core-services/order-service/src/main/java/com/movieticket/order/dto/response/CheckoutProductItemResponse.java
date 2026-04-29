package com.movieticket.order.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckoutProductItemResponse {
    private String productId;
    private String productName;
    private String productImageUrl;
    private int quantity;
    private double unitPrice;
    private double subtotal;
}
