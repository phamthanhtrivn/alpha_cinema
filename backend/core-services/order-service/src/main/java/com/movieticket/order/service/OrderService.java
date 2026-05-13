package com.movieticket.order.service;

import com.movieticket.order.common.ApiResponse;
import com.movieticket.order.dto.CheckoutEmployeeRequest;
import com.movieticket.order.dto.request.CheckInRequest;
import com.movieticket.order.event.model.PaymentByCashRequestEvent;
import com.movieticket.order.event.producer.PaymentByCashRequestedEventProducer;
import com.movieticket.order.dto.response.InfoBookingScheduleResponse;
import com.movieticket.order.dto.response.InfoBookingSeatResponse;
import com.movieticket.order.dto.response.TicketDetailResponse;
import com.movieticket.order.entity.*;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.repository.OrderDetailRepository;
import com.movieticket.order.repository.OrderRepository;
import com.movieticket.order.repository.ShowScheduleDetailRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.movieticket.order.enums.ShowSeatType;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.net.URI;
import java.util.List;
import java.util.Map;
import com.movieticket.order.client.CinemaClient;
import com.movieticket.order.client.ProductClient;
import com.movieticket.order.dto.CinemaRoomExternalDTO;
import com.movieticket.order.dto.client.*;
import com.movieticket.order.util.mapper.OrderHistoryMapper;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
        private final OrderRepository orderRepository;
        private final ShowScheduleDetailRepository showScheduleDetailRepository;
        private final OrderDetailRepository orderDataiReposioty;
        private final PaymentByCashRequestedEventProducer paymentByCashRequestedEventProducer;
        private final WebClient.Builder webClientBuilder;
        private final ProductClient productClient;
        private final CinemaClient cinemaClient;
        private final OrderHistoryMapper orderHistoryMapper;

        public String paymentByCash(String userID, String cinemaID, CheckoutEmployeeRequest request) {
                Order newOrder = createAndSaveFullOrder(userID, cinemaID, request);
                System.out.println("Order created with ID: " + newOrder.getId());

                paymentByCashRequestedEventProducer.publish(PaymentByCashRequestEvent.builder()
                                .eventId(java.util.UUID.randomUUID().toString())
                                .orderId(newOrder.getId())
                                .totalPayment(request.getTotalPayment())
                                .occurredAt(LocalDateTime.now())
                                .build());

                return newOrder.getId();
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

                List<OrderDetail> orderDetailList = request.getProducts().stream().map(product -> OrderDetail.builder()
                                .order(newOrder)
                                .quantity(product.getQuantity())
                                .price(product.getPrice())
                                .productId(product.getProductId())
                                .build()).toList();
                orderDataiReposioty.saveAll(orderDetailList);

                List<ShowScheduleDetail> showScheduleDetails = request.getSeats().stream()
                                .map(seat -> ShowScheduleDetail.builder()
                                                .order(newOrder)
                                                .seatId(seat.getSeatId())
                                                .finalPrice(seat.getFinalPrice())
                                                .ticketPriceId(seat.getTicketPriceId())
                                                .showSeatType(com.movieticket.order.entity.ShowSeatType.CHECKED_IN)
                                                .showScheduleId(request.getShowScheduleId())
                                                .build())
                                .toList();
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

        public TicketDetailResponse getTicketDetailByOrderId(String orderId, String cinemaId) {

                Order order = orderRepository
                                .findByIdAndCinemaIdAndStatusIn(orderId, cinemaId,
                                                List.of(OrderStatus.PAID, OrderStatus.CONFIRMED))
                                .orElseThrow(() -> new BusinessException(
                                                "Không tìm thấy đơn hàng với ID này hoặc đơn hàng không hợp lệ!"));

                TicketDetailResponse ticketDetailResponse = new TicketDetailResponse();
                ticketDetailResponse.setOrderId(order.getId());
                ticketDetailResponse.setTotalPayment(order.getTotalPayment());
                ticketDetailResponse.setPointDiscount(order.getPointDiscount());
                ticketDetailResponse.setPromotionDiscount(order.getPromotionDiscount());
                ticketDetailResponse.setTotalPrice(order.getTotalPrice());

                ticketDetailResponse.setCustomerName("Khách hàng");

                if (order.getShowScheduleDetails() == null || order.getShowScheduleDetails().isEmpty()) {
                        throw new BusinessException("Đơn hàng không có thông tin lịch chiếu hợp lệ.");
                }
                String showScheduleId = order.getShowScheduleDetails().get(0).getShowScheduleId();
                ticketDetailResponse.setShowScheduleId(showScheduleId);

                List<String> productIds = order.getOrderDetails() == null ? List.of()
                                : order.getOrderDetails().stream()
                                                .map(OrderDetail::getProductId)
                                                .toList();

                if (order.getStatus() == OrderStatus.CONFIRMED) {
                        productIds = List.of();
                }
                List<String> seatIds = order.getShowScheduleDetails().stream()
                                .map(ShowScheduleDetail::getSeatId)
                                .toList();

                URI requestUrlSchedule = UriComponentsBuilder
                                .fromUriString("http://product-service/api/show-schedules/get-info-for-booking")
                                .queryParam("showScheduleId", showScheduleId)
                                .queryParam("productIds", productIds)
                                .build()
                                .toUri();
                ResponseEntity<ApiResponse<InfoBookingScheduleResponse>> responseSchedule = webClientBuilder.build()
                                .get()
                                .uri(requestUrlSchedule)
                                .retrieve()
                                .toEntity(new ParameterizedTypeReference<ApiResponse<InfoBookingScheduleResponse>>() {
                                })
                                .block();

                URI requestUrlSeat = UriComponentsBuilder
                                .fromUriString("http://cinema-management-service/api/seats/get-info-for-booking")
                                .queryParam("seatIds", seatIds)
                                .build()
                                .toUri();
                ResponseEntity<ApiResponse<InfoBookingSeatResponse>> responseSeat = webClientBuilder.build()
                                .get()
                                .uri(requestUrlSeat)
                                .retrieve()
                                .toEntity(new ParameterizedTypeReference<ApiResponse<InfoBookingSeatResponse>>() {
                                })
                                .block();

                if (responseSchedule == null || responseSchedule.getBody() == null
                                || responseSchedule.getBody().getData() == null) {
                        throw new BusinessException("Không thể lấy thông tin lịch chiếu.");
                }
                if (responseSeat == null || responseSeat.getBody() == null
                                || responseSeat.getBody().getData() == null) {
                        throw new BusinessException("Không thể lấy thông tin ghế ngồi.");
                }

                InfoBookingScheduleResponse apiResponseSchedule = responseSchedule.getBody().getData();
                InfoBookingSeatResponse apiResponseSeat = responseSeat.getBody().getData();

                TicketDetailResponse.Movie movie = TicketDetailResponse.Movie.builder()
                                .nameMovie(apiResponseSchedule.getNameMovie())
                                .urlMovie(apiResponseSchedule.getUrlMovie())
                                .roomNumber(apiResponseSeat.getRoomNumber())
                                .startTime(apiResponseSchedule.getStartTime())
                                .projectionType(apiResponseSchedule.getProjectionType())
                                .build();

                Map<String, ShowScheduleDetail> seatDetailMap = order.getShowScheduleDetails().stream()
                                .collect(Collectors.toMap(
                                                ShowScheduleDetail::getSeatId,
                                                detail -> detail,
                                                (existing, replacement) -> existing));

                List<TicketDetailResponse.Seat> seats = apiResponseSeat.getSeats() == null ? List.of()
                                : apiResponseSeat.getSeats().stream().map(item -> {
                                        ShowScheduleDetail detail = seatDetailMap.get(item.getSeatId());
                                        double price = detail != null ? detail.getFinalPrice() : 0.0;

                                        ShowSeatType showSeatType = (detail != null && detail.getShowSeatType() != null)
                                                        ? com.movieticket.order.enums.ShowSeatType
                                                                        .valueOf(detail.getShowSeatType().name())
                                                        : com.movieticket.order.enums.ShowSeatType.CHECKED_IN;

                                        return TicketDetailResponse.Seat.builder()
                                                        .seatId(item.getSeatId())
                                                        .seatNumber(item.getSeatNumber())
                                                        .showSeatType(showSeatType)
                                                        .seatType(item.getSeatType())
                                                        .price(price)
                                                        .build();
                                }).toList();

                Map<String, OrderDetail> productMap = order.getOrderDetails() == null ? Map.of()
                                : order.getOrderDetails().stream()
                                                .collect(Collectors.toMap(
                                                                OrderDetail::getProductId,
                                                                detail -> detail,
                                                                (existing, replacement) -> existing));

                List<TicketDetailResponse.Product> products = apiResponseSchedule.getProducts() == null ? List.of()
                                : apiResponseSchedule.getProducts().stream().map(item -> {
                                        OrderDetail detail = productMap.get(item.getProductId());
                                        double price = detail != null ? detail.getPrice() : 0.0;
                                        int quantity = detail != null ? detail.getQuantity() : 0;

                                        return TicketDetailResponse.Product.builder()
                                                        .urlProduct(item.getUrlProduct())
                                                        .nameProduct(item.getNameProduct())
                                                        .price(price)
                                                        .quantity(quantity)
                                                        .totalPrice(price * quantity)
                                                        .build();
                                }).toList();

                ticketDetailResponse.setMovie(movie);
                ticketDetailResponse.setSeats(seats);
                ticketDetailResponse.setProducts(products);

                return ticketDetailResponse;
        }

        @Transactional
        public boolean checkIn(CheckInRequest request, String cinemaId) {
                Order order = orderRepository
                                .findByIdAndCinemaIdAndStatusIn(request.getOrderId(), cinemaId,
                                                List.of(OrderStatus.PAID, OrderStatus.CONFIRMED))
                                .orElseThrow(() -> new BusinessException(
                                                "Không tìm thấy đơn hàng hoặc đơn hàng chưa thanh toán / đã check-in!"));

                order.setStatus(OrderStatus.CONFIRMED);

                List<ShowScheduleDetail> showScheduleDetails = order.getShowScheduleDetails();
                int checkInCount = 0;

                for (ShowScheduleDetail detail : showScheduleDetails) {

                        if (detail.getShowScheduleId().equals(request.getShowScheduleId()) &&
                                        request.getSeatIds().contains(detail.getSeatId())) {

                                detail.setShowSeatType(com.movieticket.order.entity.ShowSeatType.CHECKED_IN);
                                checkInCount++;
                        }
                }
                if (checkInCount == 0) {
                        throw new BusinessException("Không có ghế nào hợp lệ hoặc khớp với lịch chiếu để check-in!");
                }
                orderRepository.save(order);

                return true;
        }

        public List<OrderHistoryResponse> customerTicketBookHistory(String customerId) {
                List<Order> orders = orderRepository.findTop20ByCustomerIdAndStatusInOrderByCreatedAtDesc(
                                customerId, List.of(OrderStatus.PAID, OrderStatus.CONFIRMED));

                if (orders.isEmpty())
                        return List.of();

                // Gom id suất chiếu
                List<String> scheduleIds = orders.stream()
                                .map(o -> o.getShowScheduleDetails().get(0).getShowScheduleId()).distinct().toList();

                return productClient.getSchedulesBatch(scheduleIds).flatMap(schedules -> {
                        var scheduleMap = schedules.stream()
                                        .collect(Collectors.toMap(ShowScheduleSnapshot::getId, s -> s));
                        var roomIds = schedules.stream().map(ShowScheduleSnapshot::getRoomId).distinct().toList();

                        return cinemaClient.getRoomsBatch(roomIds).map(rooms -> {
                                var roomMap = rooms.stream()
                                                .collect(Collectors.toMap(CinemaRoomExternalDTO::getRoomId, r -> r));

                                // MAP DỮ LIỆU: seats và products sẽ là null/empty
                                return orders.stream().map(order -> orderHistoryMapper.toSummaryResponse(order,
                                                scheduleMap, roomMap)).toList();
                        });
                }).block();
        }

        public OrderHistoryResponse getOrderDetail(String orderId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

                String scheduleId = order.getShowScheduleDetails().get(0).getShowScheduleId();
                List<String> seatIds = order.getShowScheduleDetails().stream().map(ShowScheduleDetail::getSeatId)
                                .distinct().toList();
                List<String> productIds = order.getOrderDetails().stream().map(OrderDetail::getProductId).distinct()
                                .toList();

                return Mono.zip(
                                productClient.getSchedulesBatch(List.of(scheduleId)),
                                cinemaClient.getSeatsByIds(seatIds),
                                productClient.getProducts(productIds)).flatMap(tuple -> {
                                        ShowScheduleSnapshot schedule = tuple.getT1().isEmpty() ? null
                                                        : tuple.getT1().get(0);
                                        Map<String, SeatSnapshot> seatMap = tuple.getT2();
                                        Map<String, ProductSnapshot> productMap = tuple.getT3();

                                        String roomId = (schedule != null) ? schedule.getRoomId() : null;

                                        return cinemaClient.getRoomsBatch(List.of(roomId)).map(rooms -> {
                                                CinemaRoomExternalDTO room = rooms.isEmpty() ? null : rooms.get(0);

                                                return orderHistoryMapper.toDetailResponse(order, schedule, room,
                                                                seatMap, productMap);
                                        });
                                }).block();
        }
}
