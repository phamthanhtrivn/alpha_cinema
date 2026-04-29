package com.movieticket.product.dto.client;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FormatShowtimeDTO {
    private ProjectionType projection;
    private TranslationType translation;
    private List<ShowtimeDTO> showTimes;
}
