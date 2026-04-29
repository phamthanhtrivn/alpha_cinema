package com.movieticket.product.dto.client;

import com.movieticket.product.entity.AgeType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class MoviePublicDTO {
    private String id;
    private String title;
    private String trailerUrl;
    private LocalDate premiereDate;
    private String thumbnailUrl;
    private String bannerUrl;
    private String ageType;
    private double avgRating;
}
