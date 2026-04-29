package com.movieticket.order.dto.client;

import lombok.Data;

@Data
public class CinemaLookupResponse {
    private boolean success;
    private String message;
    private CinemaSnapshot data;
}
