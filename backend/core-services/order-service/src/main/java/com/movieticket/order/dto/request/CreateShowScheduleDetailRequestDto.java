package com.movieticket.order.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateShowScheduleDetailRequestDto {
    private String showScheduleId;
    private List<SeatRequestDto> seats;
}
