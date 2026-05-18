package com.movieticket.notification.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewStatusNotificationEvent {
    private String customerId;
    private String reviewId;
    private String status;
    private String reason;
}
