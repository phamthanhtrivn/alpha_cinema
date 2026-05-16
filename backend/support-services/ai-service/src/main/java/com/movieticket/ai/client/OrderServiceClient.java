package com.movieticket.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.movieticket.ai.config.AiToolProperties;
import com.movieticket.ai.dto.tool.OrderDetailToolResponse;
import com.movieticket.ai.dto.tool.OrderProductToolResponse;
import com.movieticket.ai.dto.tool.OrderScheduleToolResponse;
import com.movieticket.ai.dto.tool.OrderSeatToolResponse;
import com.movieticket.ai.dto.tool.OrderToolResponse;
import com.movieticket.ai.dto.tool.PromotionToolResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class OrderServiceClient {
    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_LIMIT = 10;

    private final WebClient orderWebClient;
    private final Duration timeout;

    public OrderServiceClient(
            @Qualifier("orderWebClient") WebClient orderWebClient,
            AiToolProperties toolProperties
    ) {
        this.orderWebClient = orderWebClient;
        this.timeout = Duration.ofMillis(toolProperties.safeTimeoutMs());
    }

    public List<OrderToolResponse> getRecentOrders(String customerId, Integer limit) {
        if (!StringUtils.hasText(customerId)) {
            return List.of();
        }

        int safeLimit = limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(limit, MAX_LIMIT));
        ApiEnvelope<List<OrderHistoryApiResponse>> response = call(
                "getRecentOrders",
                "limit=" + safeLimit,
                orderWebClient.get()
                        .uri("/api/orders/my-orders")
                        .header("X-User-Id", customerId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<OrderHistoryApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        return response.data().stream()
                .limit(safeLimit)
                .map(this::toOrderToolResponse)
                .toList();
    }

    public OrderToolResponse getOrderStatus(String orderCode, String customerId) {
        if (!StringUtils.hasText(orderCode) || !StringUtils.hasText(customerId)) {
            return null;
        }

        return getRecentOrders(customerId, MAX_LIMIT).stream()
                .filter(order -> orderCode.equalsIgnoreCase(order.orderCode()) || orderCode.equalsIgnoreCase(order.orderId()))
                .findFirst()
                .orElse(null);
    }

    public OrderDetailToolResponse getOrderDetail(String orderId, String customerId) {
        if (!StringUtils.hasText(orderId) || !StringUtils.hasText(customerId)) {
            return null;
        }

        ApiEnvelope<OrderHistoryApiResponse> response = call(
                "getOrderDetail",
                "orderId=" + safeForLog(orderId),
                orderWebClient.get()
                        .uri("/api/orders/my-orders/{orderId}", orderId)
                        .header("X-User-Id", customerId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<OrderHistoryApiResponse>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return null;
        }

        return toOrderDetailToolResponse(response.data());
    }

    public List<PromotionToolResponse> getActivePromotions() {
        ApiEnvelope<List<PromotionApiResponse>> response = call(
                "getActivePromotions",
                "-",
                orderWebClient.get()
                        .uri("/api/promotions/public/active")
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<PromotionApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        return response.data().stream()
                .map(promotion -> new PromotionToolResponse(
                        promotion.id(),
                        promotion.code(),
                        promotion.discountPercent(),
                        promotion.startDate(),
                        promotion.endDate(),
                        promotion.remainingQuantity()
                ))
                .toList();
    }

    private OrderToolResponse toOrderToolResponse(OrderHistoryApiResponse order) {
        ShowScheduleSnapshotApiResponse schedule = order.showScheduleSnapshot();
        return new OrderToolResponse(
                order.id(),
                order.id(),
                schedule == null ? null : schedule.movieTitle(),
                order.cinemaName(),
                schedule == null ? null : schedule.startTime(),
                order.status(),
                BigDecimal.valueOf(order.totalPayment()),
                order.createdAt()
        );
    }

    private OrderDetailToolResponse toOrderDetailToolResponse(OrderHistoryApiResponse order) {
        return new OrderDetailToolResponse(
                order.id(),
                order.createdAt(),
                order.status(),
                money(order.totalPrice()),
                money(order.totalPayment()),
                money(order.pointDiscount()),
                money(order.promotionDiscount()),
                order.promotionCode(),
                order.qrCode(),
                order.cinemaName(),
                order.roomNumber(),
                toScheduleToolResponse(order.showScheduleSnapshot()),
                order.seats() == null ? List.of() : order.seats().stream().map(this::toSeatToolResponse).toList(),
                order.products() == null ? List.of() : order.products().stream().map(this::toProductToolResponse).toList()
        );
    }

    private OrderScheduleToolResponse toScheduleToolResponse(ShowScheduleSnapshotApiResponse schedule) {
        if (schedule == null) {
            return null;
        }
        return new OrderScheduleToolResponse(
                schedule.id(),
                schedule.movieId(),
                schedule.movieTitle(),
                schedule.movieThumbnailUrl(),
                schedule.ageType(),
                schedule.cinemaId(),
                schedule.roomId(),
                schedule.startTime(),
                schedule.endTime(),
                schedule.projectionType(),
                schedule.translationType()
        );
    }

    private OrderSeatToolResponse toSeatToolResponse(SeatApiResponse seat) {
        return new OrderSeatToolResponse(
                seat.id(),
                buildSeatCode(seat.rowName(), seat.columnName()),
                seat.roomId(),
                seat.seatTypeId(),
                money(seat.unitPrice())
        );
    }

    private OrderProductToolResponse toProductToolResponse(ProductApiResponse product) {
        return new OrderProductToolResponse(
                product.id(),
                product.name(),
                product.quantity(),
                product.pictureUrl(),
                money(product.unitPrice())
        );
    }

    private String buildSeatCode(String rowName, String columnName) {
        String row = rowName == null ? "" : rowName;
        String column = columnName == null ? "" : columnName;
        return row + column;
    }

    private BigDecimal money(Double value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    private String safeForLog(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }

    private <T> T call(String toolName, String params, reactor.core.publisher.Mono<T> mono) {
        try {
            return mono.timeout(timeout).block(timeout.plusMillis(500));
        } catch (Exception ex) {
            log.warn("AI tool {} failed calling order-service with params [{}]: {}", toolName, params, ex.getMessage());
            return null;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record OrderHistoryApiResponse(
            String id,
            LocalDateTime createdAt,
            Double totalPrice,
            double totalPayment,
            Double pointDiscount,
            Double promotionDiscount,
            String promotionCode,
            String qrCode,
            String cinemaName,
            String roomNumber,
            ShowScheduleSnapshotApiResponse showScheduleSnapshot,
            String status,
            List<SeatApiResponse> seats,
            List<ProductApiResponse> products
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ShowScheduleSnapshotApiResponse(
            String id,
            String movieId,
            String movieTitle,
            String movieThumbnailUrl,
            String ageType,
            String roomId,
            String cinemaId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String projectionType,
            String translationType
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record SeatApiResponse(
            String id,
            String roomId,
            String rowName,
            String columnName,
            Double unitPrice,
            String seatTypeId
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ProductApiResponse(
            String id,
            String name,
            Integer quantity,
            String pictureUrl,
            Double unitPrice
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record PromotionApiResponse(
            String id,
            String code,
            Integer discountPercent,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Integer remainingQuantity
    ) {
    }
}
