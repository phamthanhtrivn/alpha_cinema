package com.movieticket.product.event.consumer;

import com.movieticket.product.event.model.OrderSuccessfulEvent;
import com.movieticket.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderSuccessfulEventConsumer {
    private final ProductService productService;

    @KafkaListener(topics = "order-successful-events", groupId = "product-service-group")
    public void consumeOrderSuccessful(OrderSuccessfulEvent event) {
        try {
            log.info("Nhận sự kiện thanh toán thành công cho đơn hàng: {}", event.getOrderId());
            if (event.getProductItems() != null && !event.getProductItems().isEmpty()) {
                productService.deductProductStock(event.getProductItems());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý trừ tồn kho cho đơn hàng {}: {}", event.getOrderId(), e.getMessage());
        }
    }
}
