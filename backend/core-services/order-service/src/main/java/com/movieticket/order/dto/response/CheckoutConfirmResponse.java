package com.movieticket.order.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CheckoutConfirmResponse {
    private String orderId;
    private String status;
    private String message;

    private List<SeatItemResponse> seats;
    private List<CheckoutProductItemResponse> products;

    private String paymentMethod;

    private String paymentUrl;

    private double totalPayment;

}
