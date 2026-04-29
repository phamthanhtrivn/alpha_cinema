package com.movieticket.cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class SeatResponseToProduct {
    private String seatId;
    private String rowName;
    private String columnName;
    private String seatTypeId;
    private String seatType;
    private boolean isUsable;
    private String status;
}
