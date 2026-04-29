package com.movieticket.product.dto.client;

import com.movieticket.product.dto.SeatResponseToProduct;
import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder

public class BookingLayoutDTO {
    private ProjectionType projection;
    private TranslationType translation;
    private LocalDateTime startTime;

    private String cinemaId;
    private String cinemaName;
    private String roomName;

    // Danh sách ghế đã "hợp thể"
    private List<SeatResponseToProduct> seats;
}
