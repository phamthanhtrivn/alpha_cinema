package com.movieticket.payment.event.producer;

import com.movieticket.payment.event.model.PaymentResultEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentResultEventProducer {
    private static final String TOPIC = "payment-result-events";

    private final KafkaTemplate<String, PaymentResultEvent> kafkaTemplate;

    public void publish(PaymentResultEvent event) {
        kafkaTemplate.send(TOPIC, event.getOrderId(), event)
                .whenComplete((res, ex) -> {
                    if (ex != null) {
                        System.err.println("❌ SEND FAIL: " + ex.getMessage());
                    } else {
                        System.out.println("✅ SEND SUCCESS: " + event);
                    }
                });
    }
}
