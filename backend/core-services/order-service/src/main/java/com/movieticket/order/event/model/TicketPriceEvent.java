package com.movieticket.order.event.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketPriceEvent {
    private String ticketPriceId;
    private String seatTypeId;
    private String projectionType;
    private String dayType;
    private Double price;
    private boolean status;
}
