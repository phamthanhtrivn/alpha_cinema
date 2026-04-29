package com.movieticket.order.event.model;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResultEvent {
    private String eventId;
    private String paymentId;
    private String orderId;
    private String method;
    private String status;
    private String providerTransactionId;
    private String message;
    private LocalDateTime paidAt;
    private LocalDateTime occurredAt;
}
