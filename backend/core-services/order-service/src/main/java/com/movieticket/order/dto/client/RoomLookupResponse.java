package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class RoomLookupResponse {
    private boolean success;
    private String message;
    private RoomSnapshot data;
}
