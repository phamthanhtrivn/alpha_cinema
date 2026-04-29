package com.movieticket.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowScheduleLookupDto {
    private String id;
    private String movieId;
    private String movieTitle;
    private String roomId;
    private String cinemaId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String projectionType;
    private String translationType;
}
