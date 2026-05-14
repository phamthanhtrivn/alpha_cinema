package com.movieticket.product.clients;

import com.movieticket.product.dto.admin.response.CinemaServiceResponse;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;

@Component
public class OrderClient {
    private final WebClient webClient;

    public OrderClient(
            WebClient.Builder builder,
            @Value("${external-services.order-service.base-url}") String orderServiceBaseUrl
    ) {
        this.webClient = builder.baseUrl(orderServiceBaseUrl).build();
    }

    public Map<String, String> getBookedMap(String showScheduleId) {
        return this.webClient.get()
                .uri("/internal/show-schedule-details/booked-seats/{showScheduleId}", showScheduleId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {
                })
                .block();
    }
}
