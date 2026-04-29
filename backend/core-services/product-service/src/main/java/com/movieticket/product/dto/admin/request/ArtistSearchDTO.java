package com.movieticket.product.dto.admin.request;

import com.movieticket.product.enums.ArtistType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ArtistSearchDTO {
    private String name;
    private String nationality;
    private ArtistType type;
}
