package com.movieticket.product.dto.client;

import com.movieticket.product.entity.AgeType;
import com.movieticket.product.entity.Artist;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class MovieDetailPublicDTO {
    private String id;
    private String title;
    private int duration;
    private int avgRating;
    private LocalDate premiereDate;
    private String producer;
    private String description;
    private String trailerUrl;
    private String thumbnailUrl;
    private String bannerUrl;
    private String ageType;
    private int releaseYear;
    private String nationality;
    private Set<String> genre;
    private Set<ArtistSummaryDTO> actors;
    private Set<ArtistSummaryDTO> directors;
}
