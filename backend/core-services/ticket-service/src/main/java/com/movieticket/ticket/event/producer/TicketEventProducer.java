package com.movieticket.ticket.event.producer;

import com.movieticket.ticket.event.model.TicketPriceEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketEventProducer {
    private static final String TOPIC = "ticket-price-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(TicketPriceEvent event) {
        kafkaTemplate.send(TOPIC, event.getTicketPriceId(), event);
    }
}
