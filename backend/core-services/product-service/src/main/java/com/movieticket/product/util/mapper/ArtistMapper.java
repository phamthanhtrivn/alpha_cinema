package com.movieticket.product.util.mapper;

import com.movieticket.product.dto.admin.request.ArtistCreateDTO;
import com.movieticket.product.dto.admin.response.ArtistResDTO;
import com.movieticket.product.entity.Artist;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ArtistMapper {
    // Tự động map các trường trùng tên từ DTO sang Entity
    Artist toEntity(ArtistCreateDTO dto);

    ArtistResDTO toResDTO(Artist entity);

    void updateEntityFromDto(ArtistCreateDTO dto, @MappingTarget Artist entity);
    // Entity sang DTO để trả về cho Client
//    ArtistResponseDTO toDto(Artist entity);
}
