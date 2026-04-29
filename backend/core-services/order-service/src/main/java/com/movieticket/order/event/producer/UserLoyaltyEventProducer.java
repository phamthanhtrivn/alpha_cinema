package com.movieticket.order.event.producer;

import com.movieticket.order.event.model.UserLoyaltyUpdateEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserLoyaltyEventProducer {
    private static final String TOPIC = "user-loyalty-events";

    private final KafkaTemplate<String, UserLoyaltyUpdateEvent> kafkaTemplate;

    public void publish(UserLoyaltyUpdateEvent event) {
        kafkaTemplate.send(TOPIC, event.getCustomerId(), event);
    }
}
