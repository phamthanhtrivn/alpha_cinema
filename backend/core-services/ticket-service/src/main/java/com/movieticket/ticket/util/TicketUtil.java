package com.movieticket.ticket.util;

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
}
