package com.movieticket.order.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class SeatSnapshot {
    private String id;
    private String roomId;
    private String rowName;
    private String columnName;
    private double unitPrice;
    private String seatTypeId;
    private boolean status;
}
