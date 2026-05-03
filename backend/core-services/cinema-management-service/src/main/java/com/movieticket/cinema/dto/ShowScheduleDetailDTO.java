package com.movieticket.cinema.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShowScheduleDetailDTO {
    private Long id;
    private String showScheduleId;
    private String seatId;
    private String showSeatType;
}