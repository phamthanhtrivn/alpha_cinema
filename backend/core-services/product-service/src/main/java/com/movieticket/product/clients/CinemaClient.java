package com.movieticket.product.clients;

import com.movieticket.product.dto.response.RoomDetailDTO;
import com.movieticket.product.dto.response.CinemaServiceResponse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class CinemaClient {
    private final WebClient webClient;

    public CinemaClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://cinema-management-service").build();
    }

    public RoomDetailDTO getRoomDetail(String roomId) {
        return webClient
                .get()
                .uri("/api/rooms/{id}", roomId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<CinemaServiceResponse<RoomDetailDTO>>() {
                })
                .map(response -> {
                    if (!response.isSuccess()) {
                        throw new RuntimeException("Cinema Service báo lỗi: " + response.getMessage());
                    }
                    return response.getData();
                })
                .block();
    }
}