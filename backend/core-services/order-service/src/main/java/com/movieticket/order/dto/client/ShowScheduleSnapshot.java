package com.movieticket.order.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShowScheduleSnapshot {
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
