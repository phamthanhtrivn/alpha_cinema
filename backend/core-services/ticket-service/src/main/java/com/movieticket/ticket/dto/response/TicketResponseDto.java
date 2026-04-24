package com.movieticket.ticket.dto.response;

import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.ProjectionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketResponseDto {
    private String id;
    private String seatTypeId;
    private ProjectionType projectionType;
    private DayType dayType;
    private Double price;
}
