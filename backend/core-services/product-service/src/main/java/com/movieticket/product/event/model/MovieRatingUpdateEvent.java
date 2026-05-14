package com.movieticket.product.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieRatingUpdateEvent {
    private String movieId;
    private Long totalReviews;
    private Double totalSumRating;
}
