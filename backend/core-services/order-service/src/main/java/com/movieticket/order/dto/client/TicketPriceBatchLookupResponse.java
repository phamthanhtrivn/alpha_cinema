package com.movieticket.order.dto.client;

import lombok.Data;

import java.util.List;

@Data
public class TicketPriceBatchLookupResponse {
    private List<TicketPriceSnapshot> data;
}