package com.movieticket.ticket.dto;

import com.movieticket.ticket.enums.ProjectionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DetermineTicketPriceDto {
    @NotBlank(message = "Seat type ID is required")
    private String seatTypeId;
    @NotNull(message = "Projection type is required")
    private ProjectionType projectionType;
    @NotNull(message = "Show time is required")
    private LocalDateTime showTime;
}
