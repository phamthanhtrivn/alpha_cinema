package com.movieticket.ticket.dto;

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
    @NotBlank(message = "Seat type ID is required")
    private String seatTypeId;

    @NotNull(message = "Projection type is required")
    private ProjectionType projectionType;

    @NotNull(message = "Day type is required")
    private DayType dayType;

    @NotNull(message = "Price is required")
    @Min(value = 30000, message = "Price must be at least 30,000")
    @Max(value = 500000, message = "Price must be at most 500,000")
    private Double price;

    private boolean status;
}

