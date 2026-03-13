package com.movieticket.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeatTypeRequest {
    @NotBlank(message = "Tên không được rỗng")
    private String name;
    private String description;
}
