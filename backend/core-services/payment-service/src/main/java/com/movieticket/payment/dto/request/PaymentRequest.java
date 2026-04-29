package com.movieticket.payment.dto.request;

import lombok.Data;

@Data
public class PaymentRequest {
    private long amount;
    private String bankCode;
    private String bookingId;
}