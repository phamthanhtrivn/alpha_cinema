package com.movieticket.payment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResultResponse {
    private String orderId;
    private String status;
    private boolean success;
    private String method;
    private double amount;
    private String providerTransactionId;
    private String message;
    private LocalDateTime paidAt;
}
