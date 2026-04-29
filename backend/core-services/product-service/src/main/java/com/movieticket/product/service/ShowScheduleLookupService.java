package com.movieticket.product.service;

import com.movieticket.product.dto.response.ShowScheduleLookupDto;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.entity.ShowSchedule;
import com.movieticket.product.repository.ShowScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShowScheduleLookupService {
    private final ShowScheduleRepository showScheduleRepository;

    @Transactional(readOnly = true)
    public ShowScheduleLookupDto getShowScheduleById(String id) {
        ShowSchedule schedule = showScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Show schedule khong ton tai"));

        Movie movie = schedule.getMovie();
        return ShowScheduleLookupDto.builder()
                .id(schedule.getId())
                .movieId(movie == null ? null : movie.getId())
                .movieTitle(movie == null ? null : movie.getTitle())
                .roomId(schedule.getRoomId())
                .cinemaId(schedule.getCinemaId())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .projectionType(schedule.getProjectionType() == null ? null : schedule.getProjectionType().name())
                .translationType(schedule.getTranslationType() == null ? null : schedule.getTranslationType().name())
                .build();
    }
}
