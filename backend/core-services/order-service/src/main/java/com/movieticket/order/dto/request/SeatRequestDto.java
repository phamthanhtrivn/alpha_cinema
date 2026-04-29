package com.movieticket.order.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeatRequestDto {
    @NotBlank(message = "Mã ghế không được để trống")
    private String seatId;

    @NotBlank(message = "Mã giá vé không được để trống")
    private String ticketPriceId;

    @Min(value = 0, message = "Giá vé phải lớn hơn hoặc bằng 0")
    private Double finalPrice;

    private String rowName;

    private String columnName;

    private String seatNumber;
}
