package com.movieticket.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateCheckoutSessionRequest {
    @NotBlank(message = "Mã khách hàng không được để trống")
    private String customerId;

    @NotBlank(message = "Mã lịch chiếu không được để trống")
    private String showScheduleId;

    @Valid
    @NotEmpty
    private List<SeatRequestDto> seats;

    @NotBlank(message = "Mã rạp chiếu không được để trống")
    private String cinemaId;
}
