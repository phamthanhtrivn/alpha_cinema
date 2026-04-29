package com.movieticket.product.dto.admin.request;

import com.movieticket.product.entity.AgeType;
import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
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

    private String genre;
    private String artistId;
    private ProjectionType projectionType;
    private TranslationType translationType;
}