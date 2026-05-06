package com.movieticket.order.dto.client;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Data
@Builder
public class TicketPriceSnapshot {
    @Getter
    private String id;
    private String seatTypeId;
    private String projectionType;
    private String dayType;
    private double price;
    private boolean status;
}
