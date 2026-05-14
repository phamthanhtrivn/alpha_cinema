package com.movieticket.ai.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResultEvent {
    private String reviewId;
    private String aiDecision;
    private String customerId;
}