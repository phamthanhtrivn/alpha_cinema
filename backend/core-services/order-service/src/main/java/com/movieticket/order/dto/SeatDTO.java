package com.movieticket.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SeatDTO {
    @NotBlank(message = "Seat ID is required")
    private String seatId;
    @NotBlank(message = "Seat number is required")
    @Min(value = 1, message = "Seat number must be greater than 0")
    private Double finalPrice;
    @NotBlank(message = "seatType is required")
    private String seatType;
    @NotBlank(message = "ticketPriceId is required")
    private String ticketPriceId;
}
