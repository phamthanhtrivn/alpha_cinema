package com.movieticket.user.dto.request;

import com.movieticket.user.entity.Customer;
import com.movieticket.user.enums.Gender;
import com.movieticket.user.enums.ReviewStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class ReviewRequestDTO {
    @Min(value = 1, message = "Điểm đánh giá phải từ 1 đến 10.")
    @Max(value = 10, message = "Điểm đánh giá phải từ 1 đến 10.")
    private int rating;

    @NotBlank(message = "Nội dung bình luận không được để trống.")
    @Size(max = 1000, message = "Bình luận quá dài, vui lòng nhập dưới 1000 ký tự.")
    private String comment;

    @Size(max = 2, message = "Chỉ được phép đính kèm tối đa 2 hình ảnh.")
    private List<String> pictures;

    private String customerId;

    @NotBlank(message = "Movie ID không được để trống.")
    private String movieId;
}
