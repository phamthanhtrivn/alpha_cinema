package com.movieticket.order.client;

import com.movieticket.order.dto.client.PaymentSnapshot;
import com.movieticket.order.dto.request.OrderSearchRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PaymentClient {
    private final WebClient webClient;

    public PaymentClient(
            WebClient.Builder builder,
            @Value("${external-services.payment-service.base-url}") String paymentServiceBaseUrl
    ) {
        this.webClient = builder.baseUrl(paymentServiceBaseUrl).build();
    }

    public Mono<Map<String, PaymentSnapshot>> getPaymentsByOrderIds(Collection<String> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return Mono.just(Collections.emptyMap());
        }

        return webClient.post()
                .uri("/internal/payments/by-order-ids")
                .bodyValue(orderIds.stream().filter(StringUtils::hasText).distinct().toList())
                .retrieve()
                .bodyToFlux(PaymentSnapshot.class)
                .filter(payment -> StringUtils.hasText(payment.getOrderId()))
                .collect(Collectors.toMap(
                        PaymentSnapshot::getOrderId,
                        payment -> payment,
                        (first, second) -> first
                ))
                .onErrorReturn(Collections.<String, PaymentSnapshot>emptyMap());
    }

    public List<String> searchOrderIds(OrderSearchRequest request) {
        if (request == null || !hasPaymentFilters(request)) {
            return List.of();
        }

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/internal/payments/order-ids")
                        .queryParamIfPresent("method", java.util.Optional.ofNullable(blankToNull(request.getPaymentMethod())))
                        .queryParamIfPresent("status", java.util.Optional.ofNullable(blankToNull(request.getPaymentStatus())))
                        .queryParamIfPresent("paymentCode", java.util.Optional.ofNullable(blankToNull(request.getPaymentCode())))
                        .queryParamIfPresent("providerTransactionId", java.util.Optional.ofNullable(blankToNull(request.getProviderTransactionId())))
                        .build())
                .retrieve()
                .bodyToFlux(String.class)
                .collectList()
                .onErrorReturn(List.of())
                .blockOptional()
                .orElse(List.of());
    }

    public boolean hasPaymentFilters(OrderSearchRequest request) {
        return request != null && (
                StringUtils.hasText(request.getPaymentMethod())
                        || StringUtils.hasText(request.getPaymentStatus())
                        || StringUtils.hasText(request.getPaymentCode())
                        || StringUtils.hasText(request.getProviderTransactionId())
        );
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
