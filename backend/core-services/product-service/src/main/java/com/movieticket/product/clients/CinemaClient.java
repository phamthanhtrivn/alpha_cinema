package com.movieticket.product.clients;

import com.movieticket.product.dto.CinemaRoomInfoDTO;
import com.movieticket.product.dto.RoomDetailDTO;
import com.movieticket.product.dto.SeatResponseToProduct;
import com.movieticket.product.dto.admin.response.CinemaServiceResponse;
import com.movieticket.product.dto.admin.response.SelectionDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;

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

    public List<SelectionDTO> getCinemaSelectionsByIds(List<String> ids) {
        return webClient.post()
                .uri("/internal/cinemas/selections")
                .bodyValue(ids) // Gửi list IDs vào request body
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SelectionDTO>>() {
                })
                .block(); // Đợi để lấy dữ liệu về (Synchronous)
    }

    public List<SeatResponseToProduct> getPhysicalSeats(String roomId) {
        return this.webClient.get()
                .uri("/internal/seats/seat-by-room/{id}", roomId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SeatResponseToProduct>>() {
                })
                .block();
    }

    public CinemaRoomInfoDTO getLocationInfo(String cinemaId, String roomId) {
        return this.webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/internal/cinemas/location-info")
                        .queryParam("cinemaId", cinemaId)
                        .queryParam("roomId", roomId)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<CinemaRoomInfoDTO>() {
                })
                .block();
    }
}