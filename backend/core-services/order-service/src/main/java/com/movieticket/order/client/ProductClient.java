package com.movieticket.order.client;

import com.movieticket.order.dto.client.ShowScheduleSnapshot;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

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
}