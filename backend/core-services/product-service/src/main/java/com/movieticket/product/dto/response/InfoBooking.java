package com.movieticket.product.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfoBooking {
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
