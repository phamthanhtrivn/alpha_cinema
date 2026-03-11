package com.movieticket.ticket.util;

import com.movieticket.ticket.enums.DayType;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

public class DayResolver {

    public static DayType resolveDayType(LocalDateTime showTime) {
        DayOfWeek dayOfWeek = showTime.getDayOfWeek();
        int hour = showTime.getHour();

        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {

            if (hour < 17) {
                return DayType.WEEKEND_BEFORE_17;
            } else {
                return DayType.WEEKEND_AFTER_17;
            }

        }

        return DayType.WEEKDAY;
    }
}
