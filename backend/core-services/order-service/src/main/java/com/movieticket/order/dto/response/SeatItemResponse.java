package com.movieticket.order.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SeatItemResponse {
    private String seatNumber;
    private double price;
}
