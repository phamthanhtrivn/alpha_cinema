package com.movieticket.product.service;

import com.movieticket.product.clients.CinemaClient;
import com.movieticket.product.dto.RoomDetailDTO;
import com.movieticket.product.dto.request.ShowScheduleCreateDTO;
import com.movieticket.product.dto.request.ShowScheduleSearchDTO;
import com.movieticket.product.dto.request.ShowScheduleUpdateDTO;
import com.movieticket.product.dto.response.ShowScheduleResDTO;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.entity.ShowSchedule;
import com.movieticket.product.repository.ShowScheduleRepository;
import com.movieticket.product.specification.ShowScheduleSpecification;
import com.movieticket.product.util.mapper.ShowScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor

public class ShowScheduleService {
    private final ShowScheduleMapper showScheduleMapper;
    private final ShowScheduleRepository showScheduleRepository;
    private final MovieService movieService;
    private final CinemaClient cinemaClient;

    public Page<ShowScheduleResDTO> searchSchedules(ShowScheduleSearchDTO dto, Pageable pageable) {
        Specification<ShowSchedule> spec = ShowScheduleSpecification.filter(dto);

        Page<ShowSchedule> entityPage = showScheduleRepository.findAll(spec, pageable);

        return entityPage.map(showScheduleMapper::toResDTO);
    }

    @Transactional
    public ShowSchedule createShowSchedule(ShowScheduleCreateDTO dto) {
        Movie movie = movieService.getById(dto.getMovieId());
        RoomDetailDTO room = cinemaClient.getRoomDetail(dto.getRoomId());

        if (!movie.getSupportedProjection().contains(room.getProjectionType())) {
            throw new IllegalArgumentException("Phòng không hỗ trợ loại hình chiếu này");
        }

        if (!movie.getSupportedTranslation().contains(dto.getTranslationType())) {
            throw new IllegalArgumentException("Dịch thuật không được hỗ trợ cho phim này");
        }

        //Kiểm tra trùng lịch (Overlap)
        LocalDateTime endTime = dto.getStartTime().plusMinutes(movie.getDuration() + 15);
        if (showScheduleRepository.existsOverlap(dto.getRoomId(), dto.getStartTime(), endTime)) {
            throw new RuntimeException("Phòng chiếu đã bị trùng lịch!");
        }

        ShowSchedule entity = new ShowSchedule();
        entity.setMovie(movie);
        entity.setCinemaId(room.getCinemaId());
        entity.setRoomId(room.getId());
        entity.setAvailableSeat(room.getCapacity());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(endTime);
        entity.setProjectionType(room.getProjectionType());
        entity.setTranslationType(dto.getTranslationType());

        return showScheduleRepository.save(entity);
    }

    @Transactional
    public ShowSchedule update(String id, ShowScheduleUpdateDTO dto) {
        ShowSchedule entity = showScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu"));

        Movie movie = movieService.getById(dto.getMovieId());
        RoomDetailDTO room = cinemaClient.getRoomDetail(dto.getRoomId());

        if (!movie.getSupportedProjection().contains(room.getProjectionType())) {
            throw new IllegalArgumentException("Phim không hỗ trợ định dạng của phòng này");
        }
        if (!movie.getSupportedTranslation().contains(dto.getTranslationType())) {
            throw new IllegalArgumentException("Phim không hỗ trợ loại dịch thuật này");
        }

        LocalDateTime endTime = dto.getStartTime().plusMinutes(movie.getDuration() + 15);
        if (showScheduleRepository.existsOverlapExcludeId(dto.getRoomId(), dto.getStartTime(), endTime, id)) {
            throw new RuntimeException("Xung đột lịch chiếu với suất khác!");
        }

        entity.setMovie(movie);
        entity.setRoomId(room.getId());
        entity.setCinemaId(room.getCinemaId());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(endTime);
        entity.setProjectionType(room.getProjectionType());
        entity.setTranslationType(dto.getTranslationType());
        entity.setStatus(dto.getStatus());

        return showScheduleRepository.save(entity);
    }
}
