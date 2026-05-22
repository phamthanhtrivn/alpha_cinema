package com.movieticket.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.movieticket.ai.config.AiToolProperties;
import com.movieticket.ai.dto.tool.CinemaToolResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

import java.time.Duration;
import java.util.List;

@Component
@Slf4j
@CircuitBreaker(name = "cinemaService")
@Retry(name = "cinemaService")
public class CinemaServiceClient {
    private final WebClient cinemaWebClient;
    private final Duration timeout;

    public CinemaServiceClient(
            @Qualifier("cinemaWebClient") WebClient cinemaWebClient,
            AiToolProperties toolProperties
    ) {
        this.cinemaWebClient = cinemaWebClient;
        this.timeout = Duration.ofMillis(toolProperties.safeTimeoutMs());
    }

    public List<CinemaToolResponse> getCinemas() {
        ApiEnvelope<List<CinemaApiResponse>> response = call(
                "getCinemas",
                cinemaWebClient.get()
                        .uri("/api/cinemas")
                        .header("X-Cinema-Id", "ALL")
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<CinemaApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        return response.data().stream()
                .filter(cinema -> cinema.id() != null)
                .map(cinema -> new CinemaToolResponse(
                        cinema.id(),
                        cinema.name(),
                        cinema.address(),
                        null
                ))
                .toList();
    }

    public List<TicketServiceClient.SeatTypeApiResponse> getSeatTypes() {
        ApiEnvelope<List<TicketServiceClient.SeatTypeApiResponse>> response = call(
                "getSeatTypes",
                cinemaWebClient.get()
                        .uri("/api/seat-types")
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<TicketServiceClient.SeatTypeApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        return response.data();
    }

    private <T> T call(String toolName, reactor.core.publisher.Mono<T> mono) {
        try {
            return mono.timeout(timeout).block(timeout.plusMillis(500));
        } catch (Exception ex) {
            log.warn("AI tool {} failed calling cinema-service: {}", toolName, ex.getMessage());
            return null;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CinemaApiResponse(
            String id,
            String name,
            String address,
            boolean status
    ) {
    }
}
