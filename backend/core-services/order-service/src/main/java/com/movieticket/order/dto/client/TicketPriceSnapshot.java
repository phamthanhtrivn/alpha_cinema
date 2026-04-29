package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class TicketPriceSnapshot {
    private String id;
    private String seatTypeId;
    private String projectionType;
    private String dayType;
    private double price;
    private boolean status;
}
