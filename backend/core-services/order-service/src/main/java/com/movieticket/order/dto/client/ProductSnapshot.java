package com.movieticket.order.dto.client;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductSnapshot {
    private String id;
    private String name;
    private String pictureUrl;
    private double unitPrice;
    private int quantity;
    private boolean status;
}
