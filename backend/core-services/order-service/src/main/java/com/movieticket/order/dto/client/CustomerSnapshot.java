package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class CustomerSnapshot {
    private String id;
    private int loyaltyPoint;
    private boolean status;
}
