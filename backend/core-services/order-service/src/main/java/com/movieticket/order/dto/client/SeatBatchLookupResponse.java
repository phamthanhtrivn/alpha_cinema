package com.movieticket.order.dto.client;

import lombok.Data;

import java.util.List;

@Data
public class SeatBatchLookupResponse {
    private boolean success;
    private String message;
    private List<SeatSnapshot> data;
}
