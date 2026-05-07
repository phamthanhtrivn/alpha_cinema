package com.movieticket.product.service;

import com.movieticket.product.dto.admin.response.ShowScheduleLookupDto;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.entity.ShowSchedule;
import com.movieticket.product.repository.ShowScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<ShowScheduleLookupDto> getShowSchedulesByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        Map<String, ShowScheduleLookupDto> schedulesById = showScheduleRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(
                        ShowSchedule::getId,
                        schedule -> {
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
                        },
                        (first, second) -> first
                ));

        return ids.stream()
                .distinct()
                .map(schedulesById::get)
                .filter(Objects::nonNull)
                .toList();
    }
}
