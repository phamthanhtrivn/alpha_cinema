package com.movieticket.order.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfoBookingScheduleResponse {

    private String nameMovie;
    private String urlMovie;
    private String projectionType;
    private LocalDateTime startTime;
    private List<Product> products;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Product{
        private String productId;
        private String urlProduct;
        private String nameProduct;
    }
}
