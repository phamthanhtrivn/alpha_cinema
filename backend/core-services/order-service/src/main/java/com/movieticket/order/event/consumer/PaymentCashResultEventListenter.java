package com.movieticket.order.event.consumer;

import com.movieticket.order.event.model.PaymentResultEvent;
import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.repository.OrderRepository;
import com.movieticket.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentCashResultEventListenter {
    private static final String TOPIC = "payment-result-cash-events";
    
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @KafkaListener(topics = TOPIC, groupId = "order-service")
    public void consume(PaymentResultEvent event) {
        if (event == null || event.getOrderId() == null) {
            return;
        }

        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order == null) {
            return;
        }

        if (OrderStatus.PAID.equals(order.getStatus())) {
            return;
        }

        if ("SUCCESS".equalsIgnoreCase(event.getStatus())) {
            orderService.updateOrderStatus(event.getOrderId(), OrderStatus.PAID);
            return;
        }

        if ("FAILED".equalsIgnoreCase(event.getStatus())
                || "CANCELLED".equalsIgnoreCase(event.getStatus())
                || "EXPIRED".equalsIgnoreCase(event.getStatus())) {
            orderService.deleteOrder(event.getOrderId());
        }
    }
}
