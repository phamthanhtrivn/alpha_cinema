package com.movieticket.cinema.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class SeatRequest {
    @NotBlank(message = "roomId không được rỗng")
    private String roomId;
    @NotBlank(message = "seatTypeId không được rỗng")
    private String seatTypeId;
    @NotNull(message = "status không được rỗng")
    private boolean status;
    private List<SeatItem> seatItems;
}
