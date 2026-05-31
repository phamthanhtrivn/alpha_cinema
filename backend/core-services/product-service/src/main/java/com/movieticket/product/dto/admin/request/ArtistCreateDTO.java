package com.movieticket.product.dto.admin.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ArtistCreateDTO {
    @NotBlank(message = "Tên nghệ sĩ không được để trống")
    private String fullName;
    private String bio;
    private LocalDate dateOfBirth;

    @NotBlank(message = "Quốc gia không được để trống")
    private String nationality;
}
