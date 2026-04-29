package com.movieticket.cinema.dto;

import com.movieticket.cinema.entity.ProjectionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class RoomDetailDTO {
    private String id;
    private String cinemaId;
    private int roomNumber;
    private ProjectionType projectionType;
    private int capacity; // Dùng để set availableSeat ban đầu cho suất chiếu
    private boolean status;
}
