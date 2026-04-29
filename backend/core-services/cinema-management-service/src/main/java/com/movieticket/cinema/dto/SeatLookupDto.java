package com.movieticket.cinema.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SeatLookupDto {
    private String id;
    private String roomId;
    private String rowName;
    private String columnName;
    private String seatTypeId;
    private boolean status;
}
