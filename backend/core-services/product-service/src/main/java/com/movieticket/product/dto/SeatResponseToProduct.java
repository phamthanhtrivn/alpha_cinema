package com.movieticket.product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class SeatResponseToProduct {
    private String seatId;
    private String rowName;
    private String columnName;
    private String seatTypeId;
    private String seatType;
    private boolean isUsable;
    private String status;
}
