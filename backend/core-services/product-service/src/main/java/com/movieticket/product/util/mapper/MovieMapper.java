package com.movieticket.product.util.mapper;

import com.movieticket.product.dto.admin.request.MovieCreateDTO;
import com.movieticket.product.dto.admin.response.MovieSummaryDTO;
import com.movieticket.product.dto.client.ArtistSummaryDTO;
import com.movieticket.product.dto.client.MovieDetailPublicDTO;
import com.movieticket.product.dto.client.MoviePublicDTO;
import com.movieticket.product.entity.Artist;
import com.movieticket.product.entity.Movie;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MovieMapper {
    // Báo MapStruct bỏ qua các object khóa ngoại để mình tự map bằng ID trong Service
    @Mapping(target = "ageType", ignore = true)
    @Mapping(target = "actors", ignore = true)
    @Mapping(target = "directors", ignore = true)
    Movie toEntity(MovieCreateDTO dto);

    @Mapping(source = "ageType.name", target = "ageType")
    @Mapping(source = "genre", target = "genre")
    MovieSummaryDTO toResponseAdmin(Movie entity);

    @Mapping(source = "ageType.name", target = "ageType")
    MoviePublicDTO toResponsePublic(Movie entity);

    @Mapping(source = "ageType.name", target = "ageType")
    MovieDetailPublicDTO toMovieDetailPublic(Movie entity);

    ArtistSummaryDTO toArtistSummary(Artist artist);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "ageType", ignore = true)
    @Mapping(target = "actors", ignore = true)
    @Mapping(target = "directors", ignore = true)
    void updateEntityFromDto(MovieCreateDTO dto, @MappingTarget Movie entity);
}
