package com.movieticket.user.clients;

import com.movieticket.user.enums.ReviewType;
import jakarta.ws.rs.ServiceUnavailableException;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ServiceConfigurationError;

@Component
public class OrderClient {
    private final WebClient webClient;

    public OrderClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://order-service/internal").build();
    }

    public ReviewType checkReviewType(String customerId, String movieId) {
        try {
            return webClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/order/review-type")
                            .queryParam("customerId", customerId)
                            .queryParam("movieId", movieId)
                            .build())
                    .retrieve()
                    // Bắt lỗi nếu gọi thất bại (4xx, 5xx)
                    .onStatus(HttpStatusCode::isError, response ->
                            response.createException().flatMap(Mono::error))
                    .bodyToMono(ReviewType.class)
                    .block();

        } catch (Exception e) {
            throw new ServiceUnavailableException("Server đang bảo trì vui lòng thử lại lần sau");
        }
    }
}
