package com.movieticket.order.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeatRequest {
    private String seatId;
    private String ticketPriceId;
    private Double finalPrice;
}
