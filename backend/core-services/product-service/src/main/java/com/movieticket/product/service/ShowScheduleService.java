package com.movieticket.product.service;

import com.movieticket.product.clients.CinemaClient;
import com.movieticket.product.dto.RoomDetailDTO;
import com.movieticket.product.dto.admin.request.ShowScheduleCreateDTO;
import com.movieticket.product.dto.admin.request.ShowScheduleSearchDTO;
import com.movieticket.product.dto.admin.request.ShowScheduleUpdateDTO;
import com.movieticket.product.dto.admin.response.SelectionDTO;
import com.movieticket.product.dto.admin.response.ShowScheduleResDTO;
import com.movieticket.product.dto.client.CinemaShowtimeDTO;
import com.movieticket.product.dto.client.FormatShowtimeDTO;
import com.movieticket.product.dto.client.ShowScheduleView;
import com.movieticket.product.dto.client.ShowtimeDTO;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor

public class ShowScheduleService {
    private final ShowScheduleMapper showScheduleMapper;
    private final ShowScheduleRepository showScheduleRepository;
    private final MovieService movieService;
    private final CinemaClient cinemaClient;

    public Page<ShowScheduleResDTO> searchSchedules(ShowScheduleSearchDTO dto, Pageable pageable) {
        Specification<ShowSchedule> spec = Specification
                .where(ShowScheduleSpecification.hasMovieId(dto.getMovieId()))
                .and(ShowScheduleSpecification.hasCinemaId(dto.getCinemaId()))
                .and(ShowScheduleSpecification.hasRoomId(dto.getRoomId()))
                .and(ShowScheduleSpecification.onDate(dto.getDate()))
                .and(ShowScheduleSpecification.hasProjectionType(dto.getProjectionType()))
                .and(ShowScheduleSpecification.hasTranslationType(dto.getTranslationType()))
                .and(ShowScheduleSpecification.hasStatus(dto.getStatus()));

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

    public List<CinemaShowtimeDTO> getMovieShowtimes(String movieId, LocalDate date) {
        List<ShowScheduleView> schedules = showScheduleRepository.findAllByMovieIdAndDate(movieId, date);

        if (schedules.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> cinemaIds = schedules.stream()
                .map(ShowScheduleView::getCinemaId)
                .distinct()
                .toList();

        List<SelectionDTO> cinemaSelections = cinemaClient.getCinemaSelectionsByIds(cinemaIds);

        // Tạo Map tra cứu nhanh ID -> Name
        Map<String, String> cinemaMap = cinemaSelections.stream()
                .collect(Collectors.toMap(SelectionDTO::getId, SelectionDTO::getLabel));

        // dùng groupingBy kết hợp với Mapping
        return schedules.stream()
                .collect(Collectors.groupingBy(ShowScheduleView::getCinemaId))
                .entrySet().stream()
                .map(cinemaEntry -> {
                    String cId = cinemaEntry.getKey();
                    String cName = cinemaMap.getOrDefault(cId, "Rạp không xác định");

                    // Nhóm theo Format: "2D Phụ đề", "3D Lồng tiếng"...
                    List<FormatShowtimeDTO> formats = cinemaEntry.getValue().stream()
                            .collect(Collectors.groupingBy(s -> s.getProjectionType() + "|" + s.getTranslationType()))
                            .entrySet().stream()
                            .map(formatEntry -> {
                                // Tách khóa "PROJECTION|TRANSLATION" ra lại
                                String[] parts = formatEntry.getKey().split("\\|");
                                String rawProjection = parts[0];
                                String translation = parts[1];

                                // Xử lý dấu gạch dưới cho Projection
                                String projection = rawProjection.startsWith("_") ? rawProjection.substring(1) : rawProjection;

                                return FormatShowtimeDTO.builder()
                                        .projection(projection)
                                        .translation(translation)
                                        .showtimes(formatEntry.getValue().stream()
                                                .map(s -> ShowtimeDTO.builder()
                                                        .id(s.getId())
                                                        .time(s.getStartTime().toLocalTime())
                                                        .build())
                                                .sorted(Comparator.comparing(ShowtimeDTO::getTime))
                                                .toList())
                                        .build();
                            })
                            .toList();
                    return CinemaShowtimeDTO.builder()
                            .cinemaId(cId)
                            .cinemaName(cName)
                            .formats(formats)
                            .build();
                })
                .toList();
    }
}
