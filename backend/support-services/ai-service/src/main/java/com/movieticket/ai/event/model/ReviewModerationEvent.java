package com.movieticket.ai.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewModerationEvent {
    private String reviewId;
    private String comment;
    private List<String> pictures;
    private String customerId;
}
