package com.movieticket.payment.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InitiatePaymentResponse {
    private String paymentId;
    private String orderId;
    private String method;
    private String status;
    private String paymentUrl;
    private String qrCodeUrl;
    private String deeplink;
    private String message;
}
