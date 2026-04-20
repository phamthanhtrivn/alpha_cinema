package com.movieticket.cinema.dto;

import com.movieticket.cinema.entity.ProjectionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomRequest {
    @NotBlank(message = "cinemaId không được rỗng")
    private String cinemaId;
    @NotNull(message = "roomNumber không được rỗng")
    @Min(value = 1, message = "Phải >= 1")
    private int roomNumber;
    @NotNull(message = "projectionType không được rỗng")
    private ProjectionType projectionType;
    @Min(value = 1, message = "Phải >= 1")
    @NotNull(message = "catatity không được rỗng")
    private int catatity;
    @NotNull(message = "Trạng thái không rỗng")
    private boolean status;
}
