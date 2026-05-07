package com.movieticket.order.dto.client;

import lombok.Data;

import java.util.List;

@Data
public class ShowScheduleBatchLookupResponse {
    private boolean success;
    private String message;
    private List<ShowScheduleSnapshot> data;
}