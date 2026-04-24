package com.movieticket.order.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckoutConfirmResponse {
    private String orderId;
    private String status;
    private double totalPayment;
    private String message;
}
