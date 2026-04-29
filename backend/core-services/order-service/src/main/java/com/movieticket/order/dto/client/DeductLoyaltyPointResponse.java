package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class DeductLoyaltyPointResponse {
    private boolean success;
    private String message;
    private int remainingPoints;
}
