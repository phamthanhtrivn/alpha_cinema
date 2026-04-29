package com.movieticket.product.dto.admin.request;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShowScheduleCreateDTO {

    @NotBlank(message = "Movie ID không được để trống")
    private String movieId;

    @NotBlank(message = "Cinema ID không được để trống")
    private String cinemaId;

    @NotBlank(message = "Room ID không được để trống")
    private String roomId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Future(message = "Thời gian bắt đầu phải ở tương lai")
    private LocalDateTime startTime;

    @NotNull(message = "Loại dịch thuật không được để trống")
    private TranslationType translationType;
}