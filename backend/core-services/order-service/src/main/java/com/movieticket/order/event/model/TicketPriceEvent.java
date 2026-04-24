package com.movieticket.ticket.event.model;

import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.ProjectionType;
import lombok.*;

@Data
@Builder
public class TicketPriceEvent {
    private String ticketPriceId;
    private String seatTypeId;
    private ProjectionType projectionType;
    private DayType dayType;
    private Double price;
    private boolean status;
}
