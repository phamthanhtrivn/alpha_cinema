package com.movieticket.product.dto.admin.response;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ShowScheduleResDTO {
    private String id;
    private String movieId;
    private String movieTitle; // Trả về tiêu đề phim để UI hiển thị luôn, không cần gọi thêm API
    private String movieThumbnailUrl;
    private ProjectionType projectionType;
    private TranslationType translationType;
    private String roomId;
    private String cinemaId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int availableSeat;
    private boolean status;
}