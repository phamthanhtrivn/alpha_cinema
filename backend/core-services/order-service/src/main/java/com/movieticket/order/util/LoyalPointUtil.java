package com.movieticket.order.util;

import com.movieticket.order.event.model.UserLoyaltyUpdateEvent;
import com.movieticket.order.model.cache.CheckoutSessionCache;

import java.time.LocalDateTime;
import java.util.UUID;

public class LoyalPointUtil {

    public static UserLoyaltyUpdateEvent buildUserLoyaltyEventProducer(CheckoutSessionCache cache) {
        if (cache == null) {
            return null;
        }

        return UserLoyaltyUpdateEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .customerId(cache.getCustomerId())
                .orderSpending(cache.getTotalPayment())
                .pointsUsed(cache.getPointsRedeemed())
                .orderId(cache.getOrderId())
                .occurredAt(LocalDateTime.now())
                .build();
    }
}
