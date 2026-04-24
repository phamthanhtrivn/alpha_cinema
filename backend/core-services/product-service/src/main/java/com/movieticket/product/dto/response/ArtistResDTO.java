package com.movieticket.product.dto.response;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter

public class ArtistResDTO {
    private String id;

    private String fullName;

    private String bio;

    private LocalDate dateOfBirth;
    private String nationality;
    private String avatarUrl;
}
