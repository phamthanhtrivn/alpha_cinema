package com.movieticket.order.dto.client;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class SeatItemDTO {
    private String seatLabel;
    private double price;
}
