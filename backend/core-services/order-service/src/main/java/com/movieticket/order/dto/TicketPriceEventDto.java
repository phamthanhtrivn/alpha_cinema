package com.movieticket.ticket.dto;

import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.EventType;
import com.movieticket.ticket.enums.ProjectionType;
import lombok.*;

@Data
@Builder
public class TicketPriceEventDto {
    private String ticketPriceId;
    private String seatTypeId;
    private ProjectionType projectionType;
    private DayType dayType;
    private Double price;
    private boolean status;
    private EventType action; // "CREATE", "UPDATE"
}
