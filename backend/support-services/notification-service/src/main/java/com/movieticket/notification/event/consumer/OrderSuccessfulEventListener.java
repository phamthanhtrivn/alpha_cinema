package com.movieticket.notification.event.consumer;

import com.movieticket.notification.event.model.OrderSuccessfulEvent;
import com.movieticket.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderSuccessfulEventListener {
    private static final String TOPIC = "order-successful-events";

    private final EmailService emailService;
    private final RedisTemplate<String, Object> redisTemplate;

    @KafkaListener(
            topics = TOPIC,
            groupId = "notification-service"
    )
    public void consume(OrderSuccessfulEvent event) {
        try {
            if (event == null || event.getCustomerEmail() == null || event.getCustomerEmail().isBlank()) {
                System.err.println("Invalid order successful event: missing customer email");
                return;
            }

            boolean emailSent = emailService.sendOrderSuccessfulEmail(event);
            if (emailSent) {
                deleteCheckoutCache(event);
            }
        } catch (Exception ex) {
            System.err.println("Error processing order successful event: " + ex.getMessage());
            ex.printStackTrace();
        }
    }

    private void deleteCheckoutCache(OrderSuccessfulEvent event) {
        if (event.getSessionId() != null && !event.getSessionId().isBlank()) {
            redisTemplate.delete("checkout:session:" + event.getSessionId());
        }
        if (event.getOrderId() != null && !event.getOrderId().isBlank()) {
            redisTemplate.delete("checkout:session:order:" + event.getOrderId());
        }
    }
}
