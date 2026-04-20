package com.movieticket.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class SeatItem {
    @NotBlank(message = "rowName không được rỗng")
    private String rowName;
    @NotBlank(message = "rowName không được rỗng")
    private String columnName;
}
