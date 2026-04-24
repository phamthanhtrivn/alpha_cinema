package com.movieticket.order.model.cache;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutProductItemCache {
    private String productId;
    private int quantity;
    private double unitPrice;
    private double subtotal;
}
