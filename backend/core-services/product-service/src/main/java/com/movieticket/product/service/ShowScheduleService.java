package com.movieticket.product.service;

import com.movieticket.product.clients.CinemaClient;
import com.movieticket.product.clients.OrderClient;
import com.movieticket.product.dto.CinemaRoomInfoDTO;
import com.movieticket.product.dto.response.RoomDetailDTO;
import com.movieticket.product.dto.SeatResponseToProduct;
import com.movieticket.product.dto.admin.request.ShowScheduleCreateDTO;
import com.movieticket.product.dto.admin.request.ShowScheduleSearchDTO;
import com.movieticket.product.dto.admin.request.ShowScheduleUpdateDTO;
import com.movieticket.product.dto.admin.response.SelectionDTO;
import com.movieticket.product.dto.admin.response.ShowScheduleResDTO;
import com.movieticket.product.dto.client.*;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.entity.ShowSchedule;
import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import com.movieticket.product.repository.ShowScheduleRepository;
import com.movieticket.product.specification.ShowScheduleSpecification;
import com.movieticket.product.util.mapper.ShowScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor

public class ShowScheduleService {
    record FormatKey(ProjectionType projection, TranslationType translation) {
    }

    private final ShowScheduleMapper showScheduleMapper;
    private final ShowScheduleRepository showScheduleRepository;
    private final MovieService movieService;
    private final CinemaClient cinemaClient;
    private final OrderClient orderClient;

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

        if (schedules.isEmpty()) return Collections.emptyList();

        List<String> cinemaIds = schedules.stream().map(ShowScheduleView::getCinemaId).distinct().toList();
        List<SelectionDTO> cinemaSelections = cinemaClient.getCinemaSelectionsByIds(cinemaIds);
        Map<String, String> cinemaMap = cinemaSelections.stream()
                .collect(Collectors.toMap(SelectionDTO::getId, SelectionDTO::getLabel));

        //Gom nhóm: Cinema -> {Projection, Translation}
        return schedules.stream()
                .filter(s -> s.getCinemaId() != null)
                .collect(Collectors.groupingBy(ShowScheduleView::getCinemaId))
                .entrySet().stream()
                .map(cinemaEntry -> {
                    String cId = cinemaEntry.getKey();
                    String cName = cinemaMap.getOrDefault(cId, "Rạp không xác định");

                    // Gom nhóm theo cặp Enum: List.of(Projection, Translation)
                    List<FormatShowtimeDTO> formats = cinemaEntry.getValue().stream()
                            .filter(s -> s.getProjectionType() != null && s.getTranslationType() != null)
                            .collect(Collectors.groupingBy(s -> new FormatKey(s.getProjectionType(), s.getTranslationType())))
                            .entrySet().stream()
                            .map(formatEntry -> {
                                FormatKey key = formatEntry.getKey();

                                return FormatShowtimeDTO.builder()
                                        .projection(key.projection())
                                        .translation(key.translation())
                                        .showTimes(formatEntry.getValue().stream()
                                                .map(s -> ShowtimeDTO.builder()
                                                        .id(s.getId())
                                                        .time(s.getStartTime())
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

    public BookingLayoutDTO getBookingLayout(String showScheduleId) {
        ShowSchedule schedule = showScheduleRepository.findById(showScheduleId)
                .orElseThrow(() -> new RuntimeException("Suất chiếu không tồn tại"));

        CinemaRoomInfoDTO location = cinemaClient.getLocationInfo(schedule.getCinemaId(), schedule.getRoomId());

        //Gọi Cinema Service lấy ghế
        List<SeatResponseToProduct> physicalSeats = cinemaClient.getPhysicalSeats(schedule.getRoomId());

        //Gọi Order Service lấy trạng thái ghế
        Map<String, String> bookedMap = orderClient.getBookedMap(showScheduleId);

        //TRỘN DỮ LIỆU: Duyệt từng ghế vật lý, check xem có trong map đã bán không
        physicalSeats.forEach(seat -> {
            String statusFromOrder = bookedMap.get(seat.getSeatId());
            if (statusFromOrder != null) {
                seat.setStatus(statusFromOrder); // Ví dụ: SOLD hoặc LOCKED
            } else {
                seat.setStatus("AVAILABLE"); // Nếu không có trong Order Service -> Ghế trống
            }
        });

        // 5. Đóng gói tất cả thông tin lại
        return BookingLayoutDTO.builder()
                .projection(schedule.getProjectionType())
                .translation(schedule.getTranslationType())
                .startTime(schedule.getStartTime())
                .cinemaId(schedule.getCinemaId())
                .cinemaName(location.getCinemaName())
                .roomName(location.getRoomNumber())
                .seats(physicalSeats)
                .build();
    }

    public List<ShowtimeDTO> getListShowTime(String movieId, String cinemaId, LocalDate date) {
        return showScheduleRepository.findShowtimesByMovieAndCinemaAndDate(movieId, cinemaId, date)
                .stream()
                .map(v -> ShowtimeDTO.builder()
                        .id(v.getId())
                        .time(v.getStartTime()) // Cắt lấy phần giờ ở đây
                        .build())
                .toList();
    }

    public List<LocalDate> getAvailableDates(String movieId) {
        List<Date> rawDates = showScheduleRepository.getAvailableDatesByMovie(movieId);

        return rawDates.stream()
                .map(java.sql.Date::toLocalDate)
                .toList();
    }
}
