package com.movieticket.product.dto.client;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder

public class ShowtimeDTO {
    private String id;
    private LocalTime time;
}
