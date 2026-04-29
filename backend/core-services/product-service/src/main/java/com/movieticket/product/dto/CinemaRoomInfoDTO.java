package com.movieticket.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class CinemaRoomInfoDTO {
    private String cinemaName;
    private String roomNumber;
}
