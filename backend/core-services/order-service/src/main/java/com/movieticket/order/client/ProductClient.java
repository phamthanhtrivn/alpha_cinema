package com.movieticket.order.client;

import com.movieticket.order.dto.client.ProductBatchLookupResponse;
import com.movieticket.order.dto.client.ProductSnapshot;
import com.movieticket.order.dto.client.ShowScheduleSnapshot;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ProductClient {
    private final WebClient webClient;

    public ProductClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://product-service/internal").build();
    }

    public Mono<List<ShowScheduleSnapshot>> getSchedulesBatch(List<String> scheduleIds) {
        if (scheduleIds == null || scheduleIds.isEmpty()) return Mono.just(List.of());

        return webClient.post()
                .uri("/show-schedules/summary-batch")
                .bodyValue(scheduleIds)
                .retrieve()
                .bodyToFlux(ShowScheduleSnapshot.class)
                .collectList()
                .onErrorResume(e -> Mono.just(List.of()));
    }

    public Mono<Map<String, ProductSnapshot>> getProducts(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Mono.just(Collections.<String, ProductSnapshot>emptyMap());
        }

        return webClient.post()
                .uri("/api/products/batch")
                .bodyValue(productIds.stream().distinct().toList())
                .retrieve()
                .bodyToMono(ProductBatchLookupResponse.class)
                .map(response -> {
                    if (response == null || response.getData() == null) {
                        return Collections.<String, ProductSnapshot>emptyMap();
                    }
                    return response.getData().stream()
                            .collect(Collectors.toMap(
                                    ProductSnapshot::getId,
                                    p -> p,
                                    (existing, replacement) -> existing
                            ));
                })
                .onErrorReturn(Collections.emptyMap());
    }
}