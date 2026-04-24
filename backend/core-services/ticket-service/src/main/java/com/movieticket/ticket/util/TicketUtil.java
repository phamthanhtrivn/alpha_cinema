package com.movieticket.ticket.util;

import com.movieticket.ticket.event.model.TicketPriceEvent;
import com.movieticket.ticket.dto.response.TicketResponseDto;
import com.movieticket.ticket.entity.TicketPrice;

public class TicketUtil {

    public static TicketResponseDto toTicketResponseDto(TicketPrice ticketPrice) {
        TicketResponseDto dto = new TicketResponseDto();
        dto.setId(ticketPrice.getId());
        dto.setSeatTypeId(ticketPrice.getSeatTypeId());
        dto.setProjectionType(ticketPrice.getProjectionType());
        dto.setDayType(ticketPrice.getDayType());
        dto.setPrice(ticketPrice.getPrice());
        return dto;
    }

    public static TicketPriceEvent toTicketPriceEventDto(TicketPrice ticketPrice) {
        return TicketPriceEvent.builder()
                .ticketPriceId(ticketPrice.getId())
                .seatTypeId(ticketPrice.getSeatTypeId())
                .projectionType(ticketPrice.getProjectionType())
                .dayType(ticketPrice.getDayType())
                .price(ticketPrice.getPrice())
                .status(ticketPrice.isStatus())
                .build();
    }
}
