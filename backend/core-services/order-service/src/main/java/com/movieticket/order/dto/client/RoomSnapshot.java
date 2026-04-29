package com.movieticket.order.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomSnapshot {
    private String id;
    private int roomNumber;
    private int capacity;
    private boolean status;
}
