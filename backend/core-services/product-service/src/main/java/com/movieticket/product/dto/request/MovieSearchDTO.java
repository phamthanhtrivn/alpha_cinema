package com.movieticket.product.dto.request;

import com.movieticket.product.entity.AgeType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class MovieSearchDTO {
    private String title;

    private String releaseStatus;
    private String nationality;
    private String ageTypeId;

    private Integer releaseYear;
}