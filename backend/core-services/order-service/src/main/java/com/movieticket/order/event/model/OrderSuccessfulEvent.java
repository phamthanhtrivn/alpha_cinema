package com.movieticket.order.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSuccessfulEvent {
    private String eventId;
    private String sessionId;
    private String orderId;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String cinemaId;
    private String cinemaName;
    private String cinemaAddress;
    private String roomId;
    private Integer roomNumber;
    private String showScheduleId;
    private String movieId;
    private String movieTitle;
    private LocalDateTime showStartTime;
    private LocalDateTime showEndTime;
    private String projectionType;
    private String translationType;
    private List<String> seatIds;
    private List<String> seatLabels;
    private List<OrderProductItem> productItems;
    private String qrCode;
    private double totalPrice;
    private double pointDiscount;
    private double promotionDiscount;
    private double totalPayment;
    private int pointsRedeemed;
    private String paymentMethod;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime occurredAt;
}
