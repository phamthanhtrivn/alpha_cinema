package com.movieticket.payment.dto.response;

import com.movieticket.payment.enums.PaymentMethod;
import com.movieticket.payment.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSnapshot {
    private String id;
    private String orderId;
    private double amount;
    private String currency;
    private PaymentMethod method;
    private PaymentStatus status;
    private String paymentCode;
    private String providerTransactionId;
    private String providerResponse;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
    private LocalDateTime expiredAt;
}
