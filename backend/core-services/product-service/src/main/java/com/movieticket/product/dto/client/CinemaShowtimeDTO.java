package com.movieticket.product.dto.client;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CinemaShowtimeDTO {
    private String cinemaId;
    private String cinemaName;
    private List<FormatShowtimeDTO> formats;
}
