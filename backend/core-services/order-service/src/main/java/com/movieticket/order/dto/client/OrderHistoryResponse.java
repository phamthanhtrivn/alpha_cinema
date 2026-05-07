package com.movieticket.order.dto.client;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder

public class OrderHistoryResponse {
    private String id;
    private LocalDateTime createdAt;
    private double totalPrice;
    private double totalPayment;
    private double pointDiscount;
    private double promotionDiscount;
    private String qrCode;
    private String cinemaName;
    private String roomNumber;

    private ShowScheduleSnapshot showScheduleSnapshot;

    private List<SeatSnapshot> seats;
    private List<ProductItemDTO> products;
}
