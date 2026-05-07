package com.movieticket.order.dto.client;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class ProductItemDTO {
    private String name;
    private int quantity;
    private double price;
}
