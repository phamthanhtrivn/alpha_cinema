package com.movieticket.order.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CinemaSnapshot {
    private String id;
    private String name;
    private String address;
    private boolean status;
}
