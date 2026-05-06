package com.movieticket.cinema.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SeatForShowScheduleResponse {
    private String id;
    private String rowName;
    private String columnName;
    private String seatTypeName;
    private String seatTypeId;
    private String status;
}
