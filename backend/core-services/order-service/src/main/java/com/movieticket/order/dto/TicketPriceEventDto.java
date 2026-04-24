package com.movieticket.order.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketPriceEventDto {
    private String ticketPriceId;
    private String seatTypeId;
    private String projectionType;
    private String dayType;
    private Double price;
    private boolean status;
    private String action; // "CREATE", "UPDATE"
}
