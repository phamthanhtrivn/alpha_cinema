package com.movieticket.notification.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShowScheduleInfoDto {
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
