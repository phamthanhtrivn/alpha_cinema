package com.movieticket.product.dto.admin.response;

import com.movieticket.product.enums.ReleaseStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter

public class MovieSummaryDTO {
    private String id;

    private String title;
    private int duration;
    private LocalDate premiereDate;
    private String producer;

    private String thumbnailUrl;

    private String ageType;

    private int releaseYear;
    private String nationality;
    private Set<String> genre;
    private int avgRating;
    private ReleaseStatus releaseStatus;
}
