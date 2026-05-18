package com.movieticket.order.service;

import com.movieticket.order.client.PaymentClient;
import com.movieticket.order.dto.client.CinemaSnapshot;
import com.movieticket.order.dto.client.CustomerInformation;
import com.movieticket.order.dto.client.PaymentSnapshot;
import com.movieticket.order.dto.client.ProductSnapshot;
import com.movieticket.order.dto.client.RoomSnapshot;
import com.movieticket.order.dto.client.SeatSnapshot;
import com.movieticket.order.dto.client.ShowScheduleSnapshot;
import com.movieticket.order.dto.client.TicketPriceSnapshot;
import com.movieticket.order.dto.request.OrderSearchRequest;
import com.movieticket.order.dto.response.OrderDetailResponse;
import com.movieticket.order.dto.response.OrderSummaryResponse;
import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderDetail;
import com.movieticket.order.entity.ShowScheduleDetail;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.repository.OrderRepository;
import com.movieticket.order.repository.OrderDetailRepository;
import com.movieticket.order.repository.ShowScheduleDetailRepository;
import com.movieticket.order.util.OrderUtil;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderManagementService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ShowScheduleDetailRepository showScheduleDetailRepository;
    private final CheckoutPartnerGateway checkoutPartnerGateway;
    private final PaymentClient paymentClient;

    public Page<OrderSummaryResponse> searchOrders(
            OrderSearchRequest request,
            int page,
            int size,
            String sortBy,
            String direction,
            String cinemaHeaderId
    ) {
        OrderSearchRequest normalizedRequest = request == null ? new OrderSearchRequest() : request;
        String effectiveCinemaId = resolveCinemaScope(cinemaHeaderId, normalizedRequest.getCinemaId());
        boolean hasPaymentFilters = paymentClient.hasPaymentFilters(normalizedRequest);
        List<String> paymentFilteredOrderIds = hasPaymentFilters
                ? paymentClient.searchOrderIds(normalizedRequest)
                : List.of();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(parseDirection(direction), normalizeSortBy(sortBy))
        );

        Page<Order> orders = orderRepository.findAll(
                buildSpecification(normalizedRequest, effectiveCinemaId, hasPaymentFilters, paymentFilteredOrderIds),
                pageable
        );
        List<String> orderIds = orders.getContent().stream().map(Order::getId).filter(StringUtils::hasText).toList();
        Map<String, List<OrderDetail>> orderDetailsByOrderId = loadOrderDetails(orderIds);
        Map<String, List<ShowScheduleDetail>> showScheduleDetailsByOrderId = loadShowScheduleDetails(orderIds);
        Map<String, ShowScheduleSnapshot> showSchedulesById = loadShowSchedules(showScheduleDetailsByOrderId.values());
        Map<String, PaymentSnapshot> paymentsByOrderId = loadPayments(orderIds);

        return orders.map(order -> toSummaryResponse(
                order,
                orderDetailsByOrderId,
                showScheduleDetailsByOrderId,
                showSchedulesById,
                paymentsByOrderId
        ));
    }

    public OrderDetailResponse getOrderDetail(String orderId, String cinemaHeaderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found"));

        String effectiveCinemaId = resolveCinemaScope(cinemaHeaderId, null);
        if (StringUtils.hasText(effectiveCinemaId) && !Objects.equals(order.getCinemaId(), effectiveCinemaId)) {
            throw new BusinessException("Order not found");
        }

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_IdIn(List.of(orderId));
        List<ShowScheduleDetail> showScheduleDetails = showScheduleDetailRepository.findByOrder_IdIn(List.of(orderId));
        Map<String, ShowScheduleSnapshot> showSchedulesById = loadShowSchedules(Map.of(orderId, showScheduleDetails).values());
        Map<String, PaymentSnapshot> paymentsByOrderId = loadPayments(List.of(orderId));

        return toDetailResponse(order, orderDetails, showScheduleDetails, showSchedulesById, paymentsByOrderId.get(orderId));
    }

    private Specification<Order> buildSpecification(
            OrderSearchRequest request,
            String cinemaId,
            boolean hasPaymentFilters,
            List<String> paymentFilteredOrderIds
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();

            if (StringUtils.hasText(cinemaId)) {
                predicates.add(criteriaBuilder.equal(root.get("cinemaId"), cinemaId.trim()));
            }

            if (StringUtils.hasText(request.getOrderId())) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("id")), request.getOrderId().trim().toLowerCase()));
            }

            if (StringUtils.hasText(request.getCustomerId())) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("customerId")), request.getCustomerId().trim().toLowerCase()));
            }

            if (StringUtils.hasText(request.getEmployeeId())) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("employeeId")), request.getEmployeeId().trim().toLowerCase()));
            }

            if (StringUtils.hasText(request.getKeyword())) {
                String keyword = likePattern(request.getKeyword());
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("id")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("customerId")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("employeeId")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("cinemaId")), keyword)
                ));
            }

            if (request.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), request.getStatus()));
            }

            if (request.getFromDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        request.getFromDate().atStartOfDay()
                ));
            }

            if (request.getToDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("createdAt"),
                        request.getToDate().atTime(LocalTime.MAX)
                ));
            }

            if (request.getMinTotalPayment() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("totalPayment"), request.getMinTotalPayment()));
            }

            if (request.getMaxTotalPayment() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("totalPayment"), request.getMaxTotalPayment()));
            }

            if (hasPaymentFilters) {
                if (paymentFilteredOrderIds == null || paymentFilteredOrderIds.isEmpty()) {
                    predicates.add(criteriaBuilder.disjunction());
                } else {
                    predicates.add(root.get("id").in(paymentFilteredOrderIds));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private OrderSummaryResponse toSummaryResponse(
            Order order,
            Map<String, List<OrderDetail>> orderDetailsByOrderId,
            Map<String, List<ShowScheduleDetail>> showScheduleDetailsByOrderId,
            Map<String, ShowScheduleSnapshot> showSchedulesById,
            Map<String, PaymentSnapshot> paymentsByOrderId
    ) {
        List<OrderDetail> orderDetails = orderDetailsByOrderId.getOrDefault(order.getId(), List.of());
        List<ShowScheduleDetail> showScheduleDetails = showScheduleDetailsByOrderId.getOrDefault(order.getId(), List.of());
        String showScheduleId = extractShowScheduleId(showScheduleDetails);
        ShowScheduleSnapshot showSchedule = showScheduleId == null ? null : showSchedulesById.get(showScheduleId);
        PaymentSnapshot payment = paymentsByOrderId.get(order.getId());

        return OrderSummaryResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .customerName(null)
                .customerEmail(null)
                .employeeId(order.getEmployeeId())
                .cinemaId(order.getCinemaId())
                .cinemaName(null)
                .movieId(showSchedule == null ? null : showSchedule.getMovieId())
                .movieTitle(showSchedule == null ? null : showSchedule.getMovieTitle())
                .showScheduleId(showScheduleId)
                .roomId(showSchedule == null ? null : showSchedule.getRoomId())
                .roomName(null)
                .projectionType(showSchedule == null ? null : showSchedule.getProjectionType())
                .translationType(showSchedule == null ? null : showSchedule.getTranslationType())
                .showStartTime(showSchedule == null ? null : showSchedule.getStartTime())
                .createdAt(order.getCreatedAt())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .pointDiscount(order.getPointDiscount())
                .promotionDiscount(order.getPromotionDiscount())
                .totalPayment(order.getTotalPayment())
                .paymentId(payment == null ? null : payment.getId())
                .paymentMethod(payment == null ? null : payment.getMethod())
                .paymentStatus(payment == null ? null : payment.getStatus())
                .paymentAmount(payment == null ? null : payment.getAmount())
                .paymentCurrency(payment == null ? null : payment.getCurrency())
                .paymentCode(payment == null ? null : payment.getPaymentCode())
                .providerTransactionId(payment == null ? null : payment.getProviderTransactionId())
                .paidAt(payment == null ? null : payment.getPaidAt())
                .paymentCreatedAt(payment == null ? null : payment.getCreatedAt())
                .paymentUpdatedAt(payment == null ? null : payment.getUpdatedAt())
                .paymentExpiredAt(payment == null ? null : payment.getExpiredAt())
                .seatCount(countSeats(showScheduleDetails))
                .productCount(countProducts(orderDetails))
                .promotionCode(order.getPromotion() == null ? null : order.getPromotion().getCode())
                .build();
    }

    private Map<String, List<OrderDetail>> loadOrderDetails(List<String> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return Map.of();
        }

        return orderDetailRepository.findByOrder_IdIn(orderIds).stream()
                .collect(Collectors.groupingBy(detail -> detail.getOrder() == null ? null : detail.getOrder().getId(), java.util.LinkedHashMap::new, Collectors.toList()));
    }

    private Map<String, List<ShowScheduleDetail>> loadShowScheduleDetails(List<String> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return Map.of();
        }

        return showScheduleDetailRepository.findByOrder_IdIn(orderIds).stream()
                .collect(Collectors.groupingBy(detail -> detail.getOrder() == null ? null : detail.getOrder().getId(), java.util.LinkedHashMap::new, Collectors.toList()));
    }

    private Map<String, ShowScheduleSnapshot> loadShowSchedules(Iterable<List<ShowScheduleDetail>> groupedDetails) {
        if (groupedDetails == null) {
            return Map.of();
        }

        List<String> showScheduleIds = java.util.stream.StreamSupport.stream(groupedDetails.spliterator(), false)
                .flatMap(details -> details == null ? java.util.stream.Stream.empty() : details.stream())
                .map(ShowScheduleDetail::getShowScheduleId)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

        if (showScheduleIds.isEmpty()) {
            return Map.of();
        }

        return checkoutPartnerGateway.getShowScheduleSnapshots(showScheduleIds);
    }

    private Map<String, PaymentSnapshot> loadPayments(List<String> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return Map.of();
        }

        return paymentClient.getPaymentsByOrderIds(orderIds)
                .blockOptional()
                .orElse(Map.of());
    }

    private OrderDetailResponse toDetailResponse(
            Order order,
            List<OrderDetail> orderDetails,
            List<ShowScheduleDetail> showScheduleDetails,
            Map<String, ShowScheduleSnapshot> showSchedulesById,
            PaymentSnapshot payment
    ) {
        java.util.concurrent.CompletableFuture<OrderContext> contextFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> buildContext(order, showScheduleDetails, showSchedulesById));
        java.util.concurrent.CompletableFuture<List<OrderDetailResponse.OrderProductResponse>> productsFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> buildProductResponses(orderDetails));
        java.util.concurrent.CompletableFuture<List<OrderDetailResponse.OrderSeatResponse>> seatsFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> buildSeatResponses(showScheduleDetails, showSchedulesById));

        java.util.concurrent.CompletableFuture.allOf(contextFuture, productsFuture, seatsFuture).join();

        OrderContext context = contextFuture.join();
        List<OrderDetailResponse.OrderProductResponse> products = productsFuture.join();
        List<OrderDetailResponse.OrderSeatResponse> seats = seatsFuture.join();

        return OrderDetailResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .customerName(context.customer() == null ? null : context.customer().getFullName())
                .customerEmail(context.customer() == null ? null : context.customer().getEmail())
                .customerPhone(context.customer() == null ? null : context.customer().getPhone())
                .employeeId(order.getEmployeeId())
                .cinemaId(context.cinema() == null ? order.getCinemaId() : context.cinema().getId())
                .cinemaName(context.cinema() == null ? null : context.cinema().getName())
                .cinemaAddress(context.cinema() == null ? null : context.cinema().getAddress())
                .roomId(context.room() == null ? null : context.room().getId())
                .roomNumber(context.room() == null ? null : context.room().getRoomNumber())
                .movieId(context.showSchedule() == null ? null : context.showSchedule().getMovieId())
                .movieTitle(context.showSchedule() == null ? null : context.showSchedule().getMovieTitle())
                .showScheduleId(extractShowScheduleId(showScheduleDetails))
                .showStartTime(context.showSchedule() == null ? null : context.showSchedule().getStartTime())
                .showEndTime(context.showSchedule() == null ? null : context.showSchedule().getEndTime())
                .projectionType(context.showSchedule() == null ? null : context.showSchedule().getProjectionType())
                .translationType(context.showSchedule() == null ? null : context.showSchedule().getTranslationType())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .pointDiscount(order.getPointDiscount())
                .promotionDiscount(order.getPromotionDiscount())
                .totalPayment(order.getTotalPayment())
                .paymentId(payment == null ? null : payment.getId())
                .paymentMethod(payment == null ? null : payment.getMethod())
                .paymentStatus(payment == null ? null : payment.getStatus())
                .paymentAmount(payment == null ? null : payment.getAmount())
                .paymentCurrency(payment == null ? null : payment.getCurrency())
                .paymentCode(payment == null ? null : payment.getPaymentCode())
                .providerTransactionId(payment == null ? null : payment.getProviderTransactionId())
                .providerResponse(payment == null ? null : payment.getProviderResponse())
                .paidAt(payment == null ? null : payment.getPaidAt())
                .paymentCreatedAt(payment == null ? null : payment.getCreatedAt())
                .paymentUpdatedAt(payment == null ? null : payment.getUpdatedAt())
                .paymentExpiredAt(payment == null ? null : payment.getExpiredAt())
                .qrCode(order.getQrCode())
                .promotionCode(order.getPromotion() == null ? null : order.getPromotion().getCode())
                .pointsRedeemed((int) Math.round(order.getPointDiscount() / 1000.0))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .seatCount(seats.size())
                .productCount(countProducts(orderDetails))
                .seats(seats)
                .products(products)
                .build();
    }

    private OrderContext buildContext(
            Order order,
            List<ShowScheduleDetail> showScheduleDetails,
            Map<String, ShowScheduleSnapshot> showSchedulesById
    ) {
        java.util.concurrent.CompletableFuture<CustomerInformation> customerFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            if (StringUtils.hasText(order.getCustomerId())) {
                return safeLookup(() -> checkoutPartnerGateway.getCustomerInformation(order.getCustomerId()));
            }
            return null;
        });

        String showScheduleId = extractShowScheduleId(showScheduleDetails);
        final ShowScheduleSnapshot showSchedule = StringUtils.hasText(showScheduleId) ? showSchedulesById.get(showScheduleId) : null;

        java.util.concurrent.CompletableFuture<RoomSnapshot> roomFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            if (showSchedule != null) {
                return safeLookup(() -> checkoutPartnerGateway.getRoomSnapshot(showSchedule.getRoomId()));
            }
            return null;
        });

        java.util.concurrent.CompletableFuture<CinemaSnapshot> cinemaFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            if (showSchedule != null) {
                return safeLookup(() -> checkoutPartnerGateway.getCinemaSnapshot(showSchedule.getCinemaId()));
            }
            return null;
        });

        return new OrderContext(customerFuture.join(), showSchedule, roomFuture.join(), cinemaFuture.join());
    }

    private List<OrderDetailResponse.OrderSeatResponse> buildSeatResponses(List<ShowScheduleDetail> details, Map<String, ShowScheduleSnapshot> showSchedulesById) {
        if (details == null || details.isEmpty()) {
            return List.of();
        }

        String showScheduleId = extractShowScheduleId(details);
        ShowScheduleSnapshot showSchedule = showScheduleId == null ? null : showSchedulesById.get(showScheduleId);

        java.util.concurrent.CompletableFuture<Map<String, SeatSnapshot>> seatSnapshotMapFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> checkoutPartnerGateway.getSeatsByIds(
                details.stream().map(ShowScheduleDetail::getSeatId).filter(StringUtils::hasText).toList()
        ));
        
        java.util.concurrent.CompletableFuture<Map<String, TicketPriceSnapshot>> ticketPriceSnapshotMapFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> checkoutPartnerGateway.getTicketPrices(
                        details.stream()
                                .map(ShowScheduleDetail::getTicketPriceId)
                                .filter(StringUtils::hasText)
                                .toList()
                )
                .entrySet()
                .stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> OrderUtil.mapToSnapshot(entry.getValue())
                )));

        Map<String, SeatSnapshot> seatSnapshotMap = seatSnapshotMapFuture.join();
        Map<String, TicketPriceSnapshot> ticketPriceSnapshotMap = ticketPriceSnapshotMapFuture.join();

        return details.stream()
                .map(detail -> {
                    SeatSnapshot seatSnapshot = seatSnapshotMap.get(detail.getSeatId());
                    TicketPriceSnapshot ticketPriceSnapshot = ticketPriceSnapshotMap.get(detail.getTicketPriceId());
                    return OrderDetailResponse.OrderSeatResponse.builder()
                            .seatId(detail.getSeatId())
                            .seatNumber(seatNumber(seatSnapshot))
                            .rowName(seatSnapshot == null ? null : seatSnapshot.getRowName())
                            .columnName(seatSnapshot == null ? null : seatSnapshot.getColumnName())
                            .seatTypeId(ticketPriceSnapshot == null ? null : ticketPriceSnapshot.getSeatTypeId())
                            .ticketPriceId(detail.getTicketPriceId())
                            .ticketPrice(ticketPriceSnapshot == null ? 0 : ticketPriceSnapshot.getPrice())
                            .finalPrice(detail.getFinalPrice())
                            .showSeatType(detail.getShowSeatType())
                            .build();
                })
                .toList();
    }

    private List<OrderDetailResponse.OrderProductResponse> buildProductResponses(List<OrderDetail> details) {
        if (details == null || details.isEmpty()) {
            return List.of();
        }

        Map<String, ProductSnapshot> productSnapshotMap
                = checkoutPartnerGateway.getProducts(
                        details.stream()
                                .map(OrderDetail::getProductId)
                                .filter(StringUtils::hasText)
                                .toList()
                )
                        .entrySet()
                        .stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                entry -> OrderUtil.mapToProductSnapshot(entry.getValue())
                        ));

        return details.stream()
                .map(detail -> {
                    ProductSnapshot productSnapshot = productSnapshotMap.get(detail.getProductId());
                    return OrderDetailResponse.OrderProductResponse.builder()
                            .productId(detail.getProductId())
                            .productName(productSnapshot == null ? null : productSnapshot.getName())
                            .pictureUrl(productSnapshot == null ? null : productSnapshot.getPictureUrl())
                            .quantity(detail.getQuantity())
                            .unitPrice(detail.getPrice())
                            .subTotal(detail.getSubTotal())
                            .build();
                })
                .toList();
    }

    private int countSeats(List<ShowScheduleDetail> details) {
        return details == null ? 0 : details.size();
    }

    private int countProducts(List<OrderDetail> details) {
        if (details == null || details.isEmpty()) {
            return 0;
        }
        return details.stream().mapToInt(OrderDetail::getQuantity).sum();
    }

    private String extractShowScheduleId(List<ShowScheduleDetail> details) {
        if (details == null || details.isEmpty()) {
            return null;
        }

        return details.stream()
                .map(ShowScheduleDetail::getShowScheduleId)
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse(null);
    }

    private String roomName(RoomSnapshot room) {
        if (room == null) {
            return null;
        }
        return "Phòng " + room.getRoomNumber();
    }

    private String seatNumber(SeatSnapshot seatSnapshot) {
        if (seatSnapshot == null) {
            return null;
        }
        return seatSnapshot.getRowName() + seatSnapshot.getColumnName();
    }

    private String resolveCinemaScope(String headerCinemaId, String requestedCinemaId) {
        if (StringUtils.hasText(headerCinemaId) && !"ALL".equalsIgnoreCase(headerCinemaId.trim())) {
            return headerCinemaId.trim();
        }
        return StringUtils.hasText(requestedCinemaId) ? requestedCinemaId.trim() : null;
    }

    private Sort.Direction parseDirection(String direction) {
        if (StringUtils.hasText(direction) && "asc".equalsIgnoreCase(direction.trim())) {
            return Sort.Direction.ASC;
        }
        return Sort.Direction.DESC;
    }

    private String normalizeSortBy(String sortBy) {
        if (!StringUtils.hasText(sortBy)) {
            return "createdAt";
        }

        return switch (sortBy.trim()) {
            case "totalPayment", "status", "createdAt" ->
                sortBy.trim();
            default ->
                "createdAt";
        };
    }

    private String likePattern(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    private <T> T safeLookup(SupplierWithException<T> supplier) {
        try {
            return supplier.get();
        } catch (Exception ex) {
            return null;
        }
    }

    private record OrderContext(
            CustomerInformation customer,
            ShowScheduleSnapshot showSchedule,
            RoomSnapshot room,
            CinemaSnapshot cinema
            ) {

    }

    @FunctionalInterface
    private interface SupplierWithException<T> {

        T get();
    }
}
