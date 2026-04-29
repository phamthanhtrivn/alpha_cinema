package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class TicketPriceLookupResponse {
    private TicketPriceSnapshot data;
}
