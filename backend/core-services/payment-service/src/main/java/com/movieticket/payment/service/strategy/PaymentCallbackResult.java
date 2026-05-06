package com.movieticket.payment.service.strategy;

import com.movieticket.payment.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentCallbackResult {
    private String orderId;
    private String providerTransactionId;
    private String providerResponse;
    private PaymentStatus status;
}