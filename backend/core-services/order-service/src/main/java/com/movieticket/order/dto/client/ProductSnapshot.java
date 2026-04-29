package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class ProductSnapshot {
    private String id;
    private String name;
    private String pictureUrl;
    private double unitPrice;
    private boolean status;
}
