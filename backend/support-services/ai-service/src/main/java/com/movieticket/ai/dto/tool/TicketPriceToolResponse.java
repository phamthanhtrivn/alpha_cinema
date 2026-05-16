package com.movieticket.ai.dto.tool;

import java.math.BigDecimal;

public record TicketPriceToolResponse(
        String ticketPriceId,
        String seatTypeId,
        String seatTypeName,
        String projectionType,
        String dayType,
        BigDecimal price,
        Boolean status
) {
}
