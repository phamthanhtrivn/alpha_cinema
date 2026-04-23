package com.movieticket.product.util.mapper;

import com.movieticket.product.dto.request.ArtistCreateDTO;
import com.movieticket.product.dto.request.MovieCreateDTO;
import com.movieticket.product.dto.response.MovieSummaryDTO;
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

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "ageType", ignore = true)
    @Mapping(target = "actors", ignore = true)
    @Mapping(target = "directors", ignore = true)
    void updateEntityFromDto(MovieCreateDTO dto, @MappingTarget Movie entity);
}
