package com.movieticket.order.dto.response;

import com.movieticket.order.enums.ShowSeatType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetailResponse {
    private String orderId;
    private double totalPrice;
    private double pointDiscount;
    private double promotionDiscount;
    private double totalPayment;
    private String customerName;
    private String showScheduleId;
    private Movie movie;
    private List<Seat> seats;
    private List<Product> products;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Movie {
        private String nameMovie;
        private String urlMovie;
        private String projectionType;
        private Integer roomNumber;
        private LocalDateTime startTime;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Seat {
        private String seatId;
        private String seatNumber;
        private String seatType;
        private double price;
        private ShowSeatType showSeatType;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Product {
        private String nameProduct;
        private String urlProduct;
        private int quantity;
        private double price;
        private double totalPrice;
    }
}