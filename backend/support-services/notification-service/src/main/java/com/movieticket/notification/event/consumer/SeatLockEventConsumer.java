package com.movieticket.notification.event.consumer;

import com.movieticket.notification.event.model.SeatLockEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatLockEventConsumer {
    private static final String TOPIC = "seat-lock-events";

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = TOPIC, groupId = "notification-seat-lock-group")
    public void consume(SeatLockEvent event) {
        if (event == null || event.getShowScheduleId() == null || event.getShowScheduleId().isBlank()) {
            log.warn("Skip invalid seat lock event: {}", event);
            return;
        }

        String destination = "/topic/seat-locks/" + event.getShowScheduleId();
        messagingTemplate.convertAndSend(destination, event);
    }
}
