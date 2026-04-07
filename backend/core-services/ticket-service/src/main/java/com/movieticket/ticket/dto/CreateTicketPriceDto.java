package com.movieticket.ticket.dto;

import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.ProjectionType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateTicketPriceDto {
    @NotBlank(message = "Seat type ID là bắt buộc")
    private String seatTypeId;

    @NotNull(message = "Hình thức chiếu là bắt buộc")
    private ProjectionType projectionType;

    @NotNull(message = "Loại ngày là bắt buộc")
    private DayType dayType;

    @NotNull(message = "Giá vé là bắt buộc")
    @Min(value = 30000, message = "Giá vé phải ít nhất 30,000")
    @Max(value = 500000, message = "Giá vé không được vượt quá 500,000")
    private Double price;
}
