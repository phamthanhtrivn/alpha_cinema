package com.movieticket.order.model.cache;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketPriceCache {
    private String ticketPriceId;
    private Double price;
    private String seatTypeId;
    private String projectionType;
    private String dayType;
    private boolean status;
}
