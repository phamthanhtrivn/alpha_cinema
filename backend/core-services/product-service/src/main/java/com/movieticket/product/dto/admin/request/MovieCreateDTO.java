package com.movieticket.product.dto.admin.request;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.ReleaseStatus;
import com.movieticket.product.enums.TranslationType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MovieCreateDTO {

    @NotBlank(message = "Hãy nhập tên phim")
    private String title;

    private Integer duration;

    private LocalDate premiereDate;

    private String producer;

    private Integer releaseYear;

    private String description;

    private String trailerUrl;

    private String nationality;

    private String ageTypeId;

    private Set<String> actorIds;
    private Set<String> directorIds;

    private ReleaseStatus releaseStatus = ReleaseStatus.UPCOMING;
    private Set<String> genre;
    private Set<ProjectionType> supportedProjection;
    private Set<TranslationType> supportedTranslation;
}
