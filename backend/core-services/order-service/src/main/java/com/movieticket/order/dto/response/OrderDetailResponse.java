package com.movieticket.order.dto.response;

import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.entity.ShowSeatType;
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
public class OrderDetailResponse {
    private String id;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String employeeId;
    private String cinemaId;
    private String cinemaName;
    private String cinemaAddress;
    private String roomId;
    private Integer roomNumber;
    private String movieId;
    private String movieTitle;
    private String showScheduleId;
    private LocalDateTime showStartTime;
    private LocalDateTime showEndTime;
    private String projectionType;
    private String translationType;
    private OrderStatus status;
    private double totalPrice;
    private double pointDiscount;
    private double promotionDiscount;
    private double totalPayment;
    private String qrCode;
    private String promotionCode;
    private int pointsRedeemed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int seatCount;
    private int productCount;
    private List<OrderSeatResponse> seats;
    private List<OrderProductResponse> products;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSeatResponse {
        private String seatId;
        private String seatNumber;
        private String rowName;
        private String columnName;
        private String seatTypeId;
        private String ticketPriceId;
        private double ticketPrice;
        private double finalPrice;
        private ShowSeatType showSeatType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderProductResponse {
        private String productId;
        private String productName;
        private String pictureUrl;
        private int quantity;
        private double unitPrice;
        private double subTotal;
    }
}