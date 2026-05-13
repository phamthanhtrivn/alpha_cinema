package com.movieticket.order.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticket.order.client.CinemaClient;
import com.movieticket.order.client.ProductClient;
import com.movieticket.order.common.ApiResponse;
import com.movieticket.order.dto.CheckoutEmployeeRequest;
import com.movieticket.order.dto.CinemaRoomExternalDTO;
import com.movieticket.order.dto.client.*;
import com.movieticket.order.entity.*;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.model.cache.ProductCache;
import com.movieticket.order.repository.OrderDataiReposioty;
import com.movieticket.order.repository.OrderRepository;
import com.movieticket.order.repository.ShowScheduleDetailRepository;
import com.movieticket.order.util.mapper.OrderHistoryMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ShowScheduleDetailRepository showScheduleDetailRepository;
    private final OrderDataiReposioty orderDataiReposioty;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate;
    private final ProductClient productClient;
    private final CinemaClient cinemaClient;
    private final OrderHistoryMapper orderHistoryMapper;

    public String paymentByCash(String userID, String cinemaID, CheckoutEmployeeRequest request) {
        Order newOrder = createAndSaveFullOrder(userID, cinemaID, request);
        System.out.println("Order created with ID: " + userID);

        String paymentServiceUrl = "http://payment-service/api/payments/payment-by-cash";
        String urlWithParams = UriComponentsBuilder.fromHttpUrl(paymentServiceUrl)
                .queryParam("orderId", newOrder.getId())
                .queryParam("totalPayment", request.getTotalPayment())
                .toUriString();

        boolean isPaymentSuccess = false;
        try {
            ResponseEntity<ApiResponse> response = restTemplate.postForEntity(urlWithParams, null, ApiResponse.class);
            System.out.println("Response from Payment API: " + response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                isPaymentSuccess = true;
            }
        } catch (Exception e) {
            System.out.println("Lỗi gọi API Payment: " + e.getMessage());
        }

        if (isPaymentSuccess) {
            updateOrderStatus(newOrder.getId(), OrderStatus.PAID);
            return newOrder.getId();
        } else {
            deleteOrder(newOrder.getId());
            throw new BusinessException("Payment failed, order has been rolled back.");
        }
    }


    @Transactional
    public Order createAndSaveFullOrder(String userID, String cinemaID, CheckoutEmployeeRequest request) {
        Order order = Order.builder()
                .cinemaId(cinemaID)
                .employeeId(userID)
                .totalPayment(request.getTotalPayment())
                .totalPrice(request.getTotalPayment())
                .status(OrderStatus.PENDING_PAYMENT)
                .build();
        Order newOrder = orderRepository.save(order);

        List<OrderDetail> orderDetailList = request.getProducts().stream().map(product ->
                OrderDetail.builder()
                        .order(newOrder)
                        .quantity(product.getQuantity())
                        .price(product.getPrice())
                        .productId(product.getProductId())
                        .build()
        ).toList();
        orderDataiReposioty.saveAll(orderDetailList);

        List<ShowScheduleDetail> showScheduleDetails = request.getSeats().stream().map(seat ->
                ShowScheduleDetail.builder()
                        .order(newOrder)
                        .seatId(seat.getSeatId())
                        .finalPrice(seat.getFinalPrice())
                        .ticketPriceId(seat.getTicketPriceId())
                        .showSeatType(ShowSeatType.CHECKED_IN)
                        .showScheduleId(request.getShowScheduleId())
                        .build()
        ).toList();
        showScheduleDetailRepository.saveAll(showScheduleDetails);

        return newOrder;
    }

    @Transactional
    public void updateOrderStatus(String orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(status);
        orderRepository.save(order);
    }


    @Transactional
    public void deleteOrder(String orderId) {
        orderDataiReposioty.deleteByOrderId(orderId);
        showScheduleDetailRepository.deleteByOrderId(orderId);
        orderRepository.deleteById(orderId);
    }

    public List<OrderHistoryResponse> customerTicketBookHistory(String customerId) {
        List<Order> orders = orderRepository.findTop20ByCustomerIdAndStatusInOrderByCreatedAtDesc(
                customerId, List.of(OrderStatus.PAID, OrderStatus.CONFIRMED));

        if (orders.isEmpty()) return List.of();

        // Gom id suất chiếu
        List<String> scheduleIds = orders.stream().map(o -> o.getShowScheduleDetails().get(0).getShowScheduleId()).distinct().toList();

        return productClient.getSchedulesBatch(scheduleIds).flatMap(schedules -> {
            var scheduleMap = schedules.stream().collect(Collectors.toMap(ShowScheduleSnapshot::getId, s -> s));
            var roomIds = schedules.stream().map(ShowScheduleSnapshot::getRoomId).distinct().toList();

            return cinemaClient.getRoomsBatch(roomIds).map(rooms -> {
                var roomMap = rooms.stream().collect(Collectors.toMap(CinemaRoomExternalDTO::getRoomId, r -> r));

                // MAP DỮ LIỆU: seats và products sẽ là null/empty
                return orders.stream().map(order ->
                        orderHistoryMapper.toSummaryResponse(order, scheduleMap, roomMap)
                ).toList();
            });
        }).block();
    }

    public OrderHistoryResponse getOrderDetail(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        String scheduleId = order.getShowScheduleDetails().get(0).getShowScheduleId();
        List<String> seatIds = order.getShowScheduleDetails().stream().map(ShowScheduleDetail::getSeatId).distinct().toList();
        List<String> productIds = order.getOrderDetails().stream()
                .map(OrderDetail::getProductId)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(id -> !id.isBlank())
                .distinct()
                .toList();

        return Mono.zip(
                productClient.getSchedulesBatch(List.of(scheduleId)),
                cinemaClient.getSeatsByIds(seatIds),
                productClient.getProducts(productIds)
        ).flatMap(tuple -> {
            ShowScheduleSnapshot schedule = tuple.getT1().isEmpty() ? null : tuple.getT1().get(0);
            Map<String, SeatSnapshot> seatMap = tuple.getT2();
            Map<String, ProductSnapshot> productMap = tuple.getT3();

            String roomId = (schedule != null) ? schedule.getRoomId() : null;

            return cinemaClient.getRoomsBatch(List.of(roomId)).map(rooms -> {
                CinemaRoomExternalDTO room = rooms.isEmpty() ? null : rooms.get(0);

                return orderHistoryMapper.toDetailResponse(order, schedule, room, seatMap, productMap);
            });
        }).block();
    }
}
