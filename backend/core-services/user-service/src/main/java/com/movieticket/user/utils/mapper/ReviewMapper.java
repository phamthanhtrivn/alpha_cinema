package com.movieticket.user.utils.mapper;

import com.movieticket.user.dto.request.ReviewRequestDTO;
import com.movieticket.user.dto.response.ReviewResponseDTO;
import com.movieticket.user.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    // 1. Chuyển từ Entity sang Response DTO (Để trả về cho FE)
    @Mapping(source = "customer.id", target = "customerId")
    ReviewResponseDTO toResponse(Review review);

    // 2. Chuyển từ Request DTO sang Entity (Để lưu vào DB)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING") // Mặc định chờ duyệt
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "customer.id", source = "customerId")
    @Mapping(target = "reviewType", ignore = true) // Cài đặt thủ công bằng FeignClient
    Review toEntity(ReviewRequestDTO request);

    // 3. Mapping danh sách
    List<ReviewResponseDTO> toResponseList(List<Review> reviews);
}
