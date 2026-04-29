package com.movieticket.order.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SeatSnapshot {
    private String id;
    private String roomId;
    private String rowName;
    private String columnName;
    private String seatTypeId;
    private boolean status;
}
