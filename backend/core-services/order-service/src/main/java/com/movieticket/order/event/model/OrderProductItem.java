package com.movieticket.order.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderProductItem {
    private String productId;
    private String productName;
    private int quantity;
    private double price;
    private double subTotal;
}
