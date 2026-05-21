package com.movieticket.ticket.dto.request;

import com.movieticket.ticket.enums.ProjectionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ShowtimeTicketPricesDto {
    private ProjectionType projectionType;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    @NotNull(message = "Show time is required")
    private LocalDateTime showTime;
}
