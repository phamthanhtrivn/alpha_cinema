package com.movieticket.order.dto;

import com.movieticket.order.entity.ShowSeatType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShowScheduleDetailDTO {
    private Long id;
    private String showScheduleId;
    private String seatId;
    private ShowSeatType showSeatType;
}
