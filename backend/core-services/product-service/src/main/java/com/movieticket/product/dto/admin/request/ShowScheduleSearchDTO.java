package com.movieticket.product.dto.admin.request;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ShowScheduleSearchDTO {
    private String movieId;
    private String cinemaId;
    private String roomId;
    private LocalDate date; // Tìm các suất chiếu trong 1 ngày cụ thể
    private ProjectionType projectionType;
    private TranslationType translationType;
    private Boolean status;
}