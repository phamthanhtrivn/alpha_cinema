package com.movieticket.order.event.producer;

import com.movieticket.order.event.model.OrderSuccessfulEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderSuccessfulEventProducer {
    private static final String TOPIC = "order-successful-events";

    private final KafkaTemplate<String, OrderSuccessfulEvent> kafkaTemplate;

    public void publish(OrderSuccessfulEvent event) {
        kafkaTemplate.send(TOPIC, event.getOrderId(), event);
    }
}
