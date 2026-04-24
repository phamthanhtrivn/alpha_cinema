package com.movieticket.ticket.dto.request;

import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.ProjectionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTicketPriceDto {
    @NotBlank(message = "Loại ghế không được để trống")
    private String seatTypeId;

    @NotNull(message = "Loại suất chiếu không được để trống")
    private ProjectionType projectionType;

    @NotNull(message = "Loại ngày không được để trống")
    private DayType dayType;

    @NotNull(message = "Giá vé không được để trống")
    @Min(value = 30000, message = "Giá vé phải từ 30,000 trở lên")
    @Max(value = 500000, message = "Giá vé phải từ 500,000 trở xuống")
    private Double price;

    private boolean status;
}

