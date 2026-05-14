package com.movieticket.user.event.model;

import com.movieticket.user.enums.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewModerationResultEvent {
    private String reviewId;
    private ReviewStatus status;
    private String reason;
}
