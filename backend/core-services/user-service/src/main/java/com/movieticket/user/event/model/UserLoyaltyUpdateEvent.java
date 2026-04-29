package com.movieticket.user.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoyaltyUpdateEvent {
    private String eventId;
    private String customerId;

    private double orderSpending;
    private int pointsUsed;

    private String orderId;
    private LocalDateTime occurredAt;
}