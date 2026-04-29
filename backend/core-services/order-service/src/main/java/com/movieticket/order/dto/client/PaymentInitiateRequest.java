package com.movieticket.order.dto.client;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentInitiateRequest {
    private String method;
    private double amount;
    private String bankCode;
}
