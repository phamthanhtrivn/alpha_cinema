package com.movieticket.payment.dto.request;

import com.movieticket.payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InitiatePaymentRequest {
    @NotNull(message = "Payment method is required")
    private PaymentMethod method;

    private Double amount;

    private String bankCode;
}
