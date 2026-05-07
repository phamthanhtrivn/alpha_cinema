package com.movieticket.order.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)

public class CinemaRoomExternalDTO {
    private String roomId;
    private String cinemaName;
    private String roomNumber;
}