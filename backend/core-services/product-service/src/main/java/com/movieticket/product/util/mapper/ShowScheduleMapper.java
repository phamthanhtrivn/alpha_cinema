package com.movieticket.product.util.mapper;

import com.movieticket.product.dto.admin.response.ShowScheduleResDTO;
import com.movieticket.product.entity.ShowSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ShowScheduleMapper {

    @Mapping(source = "movie.id", target = "movieId")
    @Mapping(source = "movie.title", target = "movieTitle")
    @Mapping(source = "movie.thumbnailUrl", target = "movieThumbnailUrl")
    ShowScheduleResDTO toResDTO(ShowSchedule entity);

    List<ShowScheduleResDTO> toResDTOList(List<ShowSchedule> entities);
}