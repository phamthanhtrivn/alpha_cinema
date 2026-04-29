package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class PaymentInitiateSnapshot {
    private String paymentId;
    private String orderId;
    private String method;
    private String status;
    private String paymentUrl;
    private String qrCodeUrl;
    private String deeplink;
    private String message;
}
