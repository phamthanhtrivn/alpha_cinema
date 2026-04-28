package com.movieticket.product.dto.client;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FormatShowtimeDTO {
    private String projection;
    private String translation;
    private List<ShowtimeDTO> showtimes;
}
