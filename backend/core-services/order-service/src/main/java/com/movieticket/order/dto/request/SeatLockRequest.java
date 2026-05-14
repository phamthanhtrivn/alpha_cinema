package com.movieticket.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SeatLockRequest {
    @NotBlank(message = "Show schedule ID cannot be blank")
    private String showScheduleId;

    @NotEmpty(message = "Seat IDs cannot be empty")
    private List<String> seatIds;
}