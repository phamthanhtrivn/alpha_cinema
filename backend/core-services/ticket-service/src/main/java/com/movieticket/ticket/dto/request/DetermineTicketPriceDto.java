package com.movieticket.ticket.dto.request;

import com.movieticket.ticket.enums.ProjectionType;
import jakarta.validation.constraints.NotBlank;
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
public class DetermineTicketPriceDto {
    @NotBlank(message = "Loại ghế không được để trống")
    private String seatTypeId;

    private ProjectionType projectionType;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    @NotNull(message = "Thời gian chiếu không được để trống")
    private LocalDateTime showTime;
}
