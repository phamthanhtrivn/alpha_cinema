package com.movieticket.payment.event.consumer;

import com.movieticket.payment.event.model.PaymentByCashRequestEvent;
import com.movieticket.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentByCashRequestEventListener {
    private static final String TOPIC = "payment-by-cash-requests";

    private final PaymentService paymentService;

    @KafkaListener(
            topics = TOPIC,
            groupId = "payment-service"
    )
    public void consume(PaymentByCashRequestEvent event) {
        if (event == null || event.getOrderId() == null || event.getOrderId().isBlank()) {
            System.err.println("Invalid cash payment request event");
            return;
        }

        paymentService.paymentByCash(event.getOrderId(), event.getTotalPayment());
    }
}