package com.movieticket.product.dto;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ShowScheduleDto {
    private String id;
    private ProjectionType projectionType;
    private TranslationType translationType;
    private String roomId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int availableSeat;
    private boolean status;
}
