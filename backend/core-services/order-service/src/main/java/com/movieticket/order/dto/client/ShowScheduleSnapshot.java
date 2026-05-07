package com.movieticket.order.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShowScheduleSnapshot {
    private String id;
    private String movieId;
    private String movieTitle;
    private String movieThumbnailUrl;
    private String ageType;
    private String roomId;
    private String cinemaId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String projectionType;
    private String translationType;
}
