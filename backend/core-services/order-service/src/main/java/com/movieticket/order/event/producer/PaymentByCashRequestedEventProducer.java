package com.movieticket.order.event.producer;

import com.movieticket.order.event.model.PaymentByCashRequestEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentByCashRequestedEventProducer {
    private static final String TOPIC = "payment-by-cash-requests";

    private final KafkaTemplate<String, PaymentByCashRequestEvent> kafkaTemplate;

    public void publish(PaymentByCashRequestEvent event) {
        kafkaTemplate.send(TOPIC, event.getOrderId(), event);
    }
}