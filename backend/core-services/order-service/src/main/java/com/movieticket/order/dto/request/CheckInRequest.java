package com.movieticket.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckInRequest {
    @NotBlank(message = "Order ID cannot be blank")
    private String orderId;
    @NotBlank(message = "Show Schedule ID cannot be blank")
    private String showScheduleId;
    @NotNull(message = "Seat IDs cannot be null")
    private List<String> seatIds;
}
