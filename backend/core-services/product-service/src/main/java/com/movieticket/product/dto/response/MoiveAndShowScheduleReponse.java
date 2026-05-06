package com.movieticket.product.dto.response;

import com.movieticket.product.dto.ShowScheduleDto;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.entity.ShowSchedule;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class MoiveAndShowScheduleReponse {
    private Movie movie;
    private List<ShowScheduleDto> showSchedules;
}
