package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class PaymentInitiateLookupResponse {
    private boolean success;
    private String message;
    private PaymentInitiateSnapshot data;
}
