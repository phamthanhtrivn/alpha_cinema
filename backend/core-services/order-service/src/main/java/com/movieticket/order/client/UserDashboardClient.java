package com.movieticket.order.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class UserDashboardClient {
    private final WebClient webClient;

    public UserDashboardClient(
            WebClient.Builder builder,
            @Value("${external-services.user-service.base-url}") String userServiceBaseUrl
    ) {
        this.webClient = builder.baseUrl(userServiceBaseUrl).build();
    }

    public Map<String, Object> getDashboard(String range, Integer year, Integer month, Integer week, String cinemaId) {
        return getDashboardAsync(range, year, month, week, cinemaId)
                .blockOptional()
                .orElse(Collections.emptyMap());
    }

    public Mono<Map<String, Object>> getDashboardAsync(String range, Integer year, Integer month, Integer week, String cinemaId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/users/dashboard/admin")
                        .queryParam("range", range)
                        .queryParamIfPresent("year", java.util.Optional.ofNullable(year))
                        .queryParamIfPresent("month", java.util.Optional.ofNullable(month))
                        .queryParamIfPresent("week", java.util.Optional.ofNullable(week))
                        .queryParamIfPresent("cinemaId", java.util.Optional.ofNullable(cinemaId))
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(this::unwrapData)
                .onErrorReturn(Collections.emptyMap());
    }

    public Mono<Map<String, String>> getCustomerNamesByIds(List<String> customerIds) {
        if (customerIds == null || customerIds.isEmpty()) {
            return Mono.just(Map.of());
        }

        return webClient.post()
                .uri("/api/customers/batch/names")
                .bodyValue(customerIds)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(this::unwrapData)
                .map(data -> data.entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                entry -> String.valueOf(entry.getValue())
                        )))
                .onErrorReturn(Map.of());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> unwrapData(Map<String, Object> response) {
        Object data = response == null ? null : response.get("data");
        if (data instanceof Map<?, ?> dataMap) {
            return (Map<String, Object>) dataMap;
        }
        return Collections.emptyMap();
    }
}
