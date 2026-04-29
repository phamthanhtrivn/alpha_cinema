package com.movieticket.order.event.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.entity.ShowScheduleDetail;
import com.movieticket.order.entity.ShowSeatType;
import com.movieticket.order.event.model.*;
import com.movieticket.order.event.producer.OrderSuccessfulEventProducer;
import com.movieticket.order.event.producer.UserLoyaltyEventProducer;
import com.movieticket.order.model.cache.CheckoutSessionCache;
import com.movieticket.order.repository.OrderRepository;
import com.movieticket.order.service.ShowScheduleDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentResultEventListener {
    private static final String TOPIC = "payment-result-events";

    private final OrderRepository orderRepository;
    private final UserLoyaltyEventProducer userLoyaltyEventProducer;
    private final OrderSuccessfulEventProducer orderSuccessfulEventProducer;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ShowScheduleDetailService showScheduleDetailService;

    @Transactional
    @KafkaListener(
            topics = TOPIC,
            groupId = "order-service"
    )
    public void consume(PaymentResultEvent event) {
        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order == null || OrderStatus.PAID.equals(order.getStatus())) {
            System.out.println("Đơn hàng không tìm thấy hoặc đã được thanh toán: " + event.getOrderId());
            return;
        }

        CheckoutSessionCache cache = getCheckoutCache(order.getId());

        if ("SUCCESS".equalsIgnoreCase(event.getStatus())) {
            order.setStatus(OrderStatus.PAID);

            List<ShowScheduleDetail> showScheduleDetails = order.getShowScheduleDetails();
            if (showScheduleDetails != null) {
                showScheduleDetails.forEach(detail -> detail.setShowSeatType(ShowSeatType.SOLD));
            }

            orderRepository.save(order);

            UserLoyaltyUpdateEvent loyaltyEvent = buildUserLoyaltyEventProducer(cache);
            userLoyaltyEventProducer.publish(loyaltyEvent);

            OrderSuccessfulEvent orderEvent = buildOrderSuccessfulEvent(order, cache, event);
            if (orderEvent.getCustomerEmail() != null && !orderEvent.getCustomerEmail().isBlank()) {
                orderSuccessfulEventProducer.publish(orderEvent);
            }

            return;
        }

        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
        showScheduleDetailService.releaseBookedSeats(order.getId());
        deleteCheckoutCache(cache, order.getId());
    }

    private OrderSuccessfulEvent buildOrderSuccessfulEvent(
            Order order,
            CheckoutSessionCache cache,
            PaymentResultEvent event
    ) {
        List<ShowScheduleDetail> showScheduleDetails = order.getShowScheduleDetails();
        List<String> seatIds = showScheduleDetails == null
                ? Collections.emptyList()
                : showScheduleDetails.stream()
                .map(ShowScheduleDetail::getSeatId)
                .filter(seatId -> seatId != null && !seatId.isBlank())
                .collect(Collectors.toList());

        List<String> seatLabels = cache == null || cache.getSeats() == null
                ? Collections.emptyList()
                : cache.getSeats().stream()
                .map(seat -> seat.getSeatNumber() == null || seat.getSeatNumber().isBlank()
                        ? seat.getSeatId()
                        : seat.getSeatNumber())
                .toList();

        List<OrderProductItem> productItems = cache == null || cache.getItems() == null
                ? Collections.emptyList()
                : cache.getItems().stream()
                .map(item -> OrderProductItem.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getUnitPrice())
                        .subTotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderSuccessfulEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .sessionId(cache == null ? null : cache.getSessionId())
                .orderId(order.getId())
                .customerId(order.getCustomerId())
                .customerName(cache == null ? null : cache.getCustomerName())
                .customerEmail(cache == null ? null : cache.getCustomerEmail())
                .cinemaId(order.getCinemaId())
                .cinemaName(cache == null ? null : cache.getCinemaName())
                .cinemaAddress(cache == null ? null : cache.getCinemaAddress())
                .roomId(cache == null ? null : cache.getRoomId())
                .roomNumber(cache == null ? null : cache.getRoomNumber())
                .showScheduleId(cache == null ? null : cache.getShowScheduleId())
                .movieId(cache == null ? null : cache.getMovieId())
                .movieTitle(cache == null ? null : cache.getMovieTitle())
                .showStartTime(cache == null ? null : cache.getShowStartTime())
                .showEndTime(cache == null ? null : cache.getShowEndTime())
                .projectionType(cache == null ? null : cache.getProjectionType())
                .translationType(cache == null ? null : cache.getTranslationType())
                .seatIds(seatIds)
                .seatLabels(seatLabels)
                .productItems(productItems)
                .qrCode(order.getQrCode())
                .totalPrice(order.getTotalPrice())
                .pointDiscount(order.getPointDiscount())
                .promotionDiscount(order.getPromotionDiscount())
                .totalPayment(order.getTotalPayment())
                .pointsRedeemed(cache == null ? 0 : cache.getPointsRedeemed())
                .paymentMethod(event.getMethod())
                .status("SUCCESS")
                .paidAt(event.getPaidAt() == null ? LocalDateTime.now() : event.getPaidAt())
                .occurredAt(LocalDateTime.now())
                .build();
    }

    private UserLoyaltyUpdateEvent buildUserLoyaltyEventProducer(CheckoutSessionCache cache) {
        if (cache == null) {
            return null;
        }

        return UserLoyaltyUpdateEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .customerId(cache.getCustomerId())
                .orderSpending(cache.getTotalPayment())
                .pointsUsed(cache.getPointsRedeemed())
                .orderId(cache.getOrderId())
                .occurredAt(LocalDateTime.now())
                .build();
    }

    private CheckoutSessionCache getCheckoutCache(String orderId) {
        Object cached = redisTemplate.opsForValue().get(buildOrderCacheKey(orderId));

        if (cached instanceof CheckoutSessionCache checkoutSessionCache) {
            return checkoutSessionCache;
        }
        if (cached instanceof Map<?, ?>) {
            try {
                return objectMapper.convertValue(cached, CheckoutSessionCache.class);
            } catch (IllegalArgumentException ignored) {
                return null;
            }
        }
        return null;
    }

    private void deleteCheckoutCache(CheckoutSessionCache cache, String orderId) {
        redisTemplate.delete(buildOrderCacheKey(orderId));
        if (cache != null && cache.getSessionId() != null && !cache.getSessionId().isBlank()) {
            redisTemplate.delete(buildSessionKey(cache.getSessionId()));
        }
    }

    private String buildOrderCacheKey(String orderId) {
        return "checkout:session:order:" + orderId;
    }

    private String buildSessionKey(String sessionId) {
        return "checkout:session:" + sessionId;
    }
}
