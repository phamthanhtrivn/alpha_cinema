package com.movieticket.order.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    private int availableSeat;
    private boolean status;
    private String projectionType;
    private String translationType;
}
