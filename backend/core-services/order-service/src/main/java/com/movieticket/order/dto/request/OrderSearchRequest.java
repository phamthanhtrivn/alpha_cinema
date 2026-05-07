package com.movieticket.order.dto.request;

import com.movieticket.order.entity.OrderStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class OrderSearchRequest {
    private String keyword;
    private String orderId;
    private String customerId;
    private String employeeId;
    private String cinemaId;
    private OrderStatus status;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Double minTotalPayment;
    private Double maxTotalPayment;
}