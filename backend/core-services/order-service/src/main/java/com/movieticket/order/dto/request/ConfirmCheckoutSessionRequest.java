package com.movieticket.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmCheckoutSessionRequest {
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String bankCode;
}