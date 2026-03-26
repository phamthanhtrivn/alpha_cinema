package com.movieticket.ticket.util;

import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DayTypeResolver {
    private final HolidayRepository holidayRepository;

    public DayType resolveDayType(LocalDateTime showTime) {
        LocalDate date = showTime.toLocalDate();

        if (holidayRepository.isHoliday(date)) {
            return DayType.HOLIDAY;
        }

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
