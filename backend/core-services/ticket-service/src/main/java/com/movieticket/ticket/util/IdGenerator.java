package com.movieticket.ticket.util;

import java.util.UUID;

public class IdGenerator {

    public static String generateTicketPriceId() {
        return "TP" + UUID.randomUUID().toString().substring(0, 10);
    }

    public static String generateHolidayId() {
        return "HD" + UUID.randomUUID().toString().substring(0, 10);
    }
}
