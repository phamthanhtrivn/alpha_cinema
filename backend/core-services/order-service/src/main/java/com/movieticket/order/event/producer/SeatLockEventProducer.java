package com.movieticket.order.event.producer;

import com.movieticket.order.event.model.SeatLockEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SeatLockEventProducer {
    private static final String TOPIC = "seat-lock-events";

    private final KafkaTemplate<String, SeatLockEvent> kafkaTemplate;

    public void publish(SeatLockEvent event) {
        if (event == null || event.getShowScheduleId() == null || event.getShowScheduleId().isBlank()) {
            return;
        }

        kafkaTemplate.send(TOPIC, event.getShowScheduleId(), event);
    }
}
