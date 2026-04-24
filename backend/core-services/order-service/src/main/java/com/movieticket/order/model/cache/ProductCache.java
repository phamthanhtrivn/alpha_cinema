package com.movieticket.order.model.cache;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCache {
    private String productId;
    private String name;
    private double unitPrice;
    private boolean status;
}
