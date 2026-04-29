package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class ShowScheduleLookupResponse {
    private boolean success;
    private String message;
    private ShowScheduleSnapshot data;
}
