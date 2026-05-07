package com.movieticket.order.client;

import com.movieticket.order.dto.CinemaRoomExternalDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class CinemaClient {
    private final WebClient webClient;

    public CinemaClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://cinema-management-service/internal").build();
    }

    public Mono<List<CinemaRoomExternalDTO>> getRoomsBatch(List<String> roomIds) {
        if (roomIds == null || roomIds.isEmpty()) return Mono.just(List.of());

        return webClient.post()
                .uri("/cinemas/batch")
                .bodyValue(roomIds)
                .retrieve()
                .bodyToFlux(CinemaRoomExternalDTO.class)
                .collectList()
                .onErrorResume(e -> {
                    // Log lỗi và trả về list trống để không làm sập cả luồng lịch sử
                    return Mono.just(List.of());
                });
    }

}
