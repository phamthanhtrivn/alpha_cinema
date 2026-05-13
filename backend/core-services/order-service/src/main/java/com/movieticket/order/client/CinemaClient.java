package com.movieticket.order.client;

import com.movieticket.order.dto.CinemaRoomExternalDTO;
import com.movieticket.order.dto.client.SeatBatchLookupResponse;
import com.movieticket.order.dto.client.SeatSnapshot;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class CinemaClient {
    private final WebClient webClient;

    public CinemaClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://cinema-management-service").build();
    }

    public Mono<List<CinemaRoomExternalDTO>> getRoomsBatch(List<String> roomIds) {
        if (roomIds == null || roomIds.isEmpty()) return Mono.just(List.of());

        return webClient.post()
                .uri("/internal/cinemas/batch")
                .bodyValue(roomIds)
                .retrieve()
                .bodyToFlux(CinemaRoomExternalDTO.class)
                .collectList()
                .onErrorResume(e -> {
                    // Log lỗi và trả về list trống để không làm sập cả luồng lịch sử
                    return Mono.just(List.of());
                });
    }

    public Mono<Map<String, SeatSnapshot>> getSeatsByIds(List<String> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            return Mono.just(Collections.<String, SeatSnapshot>emptyMap());
        }

        return webClient.post()
                .uri("/api/seats/batch")
                .bodyValue(seatIds.stream().distinct().toList())
                .retrieve()
                .bodyToMono(SeatBatchLookupResponse.class)
                .map(response -> {
                    if (response == null || response.getData() == null) {
                        return Collections.<String, SeatSnapshot>emptyMap();
                    }
                    return response.getData().stream()
                            .collect(Collectors.toMap(
                                    SeatSnapshot::getId,
                                    s -> s,
                                    (existing, replacement) -> existing // Xử lý nếu trùng key
                            ));
                })
                .onErrorReturn(Collections.emptyMap());
    }

}
