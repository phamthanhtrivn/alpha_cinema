package com.movieticket.payment.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentByCashRequestEvent {
    private String eventId;
    private String orderId;
    private Double totalPayment;
    private LocalDateTime occurredAt;
}