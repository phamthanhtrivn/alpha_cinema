package com.movieticket.order.dto.response;

import com.movieticket.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryResponse {
    private String id;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String employeeId;
    private String cinemaId;
    private String cinemaName;
    private String movieId;
    private String movieTitle;
    private String showScheduleId;
    private String roomId;
    private String roomName;
    private String projectionType;
    private String translationType;
    private LocalDateTime showStartTime;
    private LocalDateTime createdAt;
    private OrderStatus status;
    private double totalPrice;
    private double pointDiscount;
    private double promotionDiscount;
    private double totalPayment;
    private int seatCount;
    private int productCount;
    private String promotionCode;
}