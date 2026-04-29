package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.dto.admin.request.ShowScheduleCreateDTO;
import com.movieticket.product.dto.admin.request.ShowScheduleSearchDTO;
import com.movieticket.product.dto.admin.request.ShowScheduleUpdateDTO;
import com.movieticket.product.dto.admin.response.ShowScheduleResDTO;
import com.movieticket.product.dto.client.BookingLayoutDTO;
import com.movieticket.product.dto.client.CinemaShowtimeDTO;
import com.movieticket.product.dto.client.ShowtimeDTO;
import com.movieticket.product.entity.ShowSchedule;
import com.movieticket.product.service.ShowScheduleLookupService;
import com.movieticket.product.service.ShowScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.movieticket.product.dto.response.ShowScheduleLookupDto;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/show-schedules")
@RequiredArgsConstructor
public class ShowScheduleController {
    private final ShowScheduleService showScheduleService;
    private final ShowScheduleLookupService showScheduleLookupService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowScheduleLookupDto>> getShowScheduleById(@PathVariable String id) {
        ShowScheduleLookupDto showSchedule = showScheduleLookupService.getShowScheduleById(id);
        ApiResponse<ShowScheduleLookupDto> response = ApiResponse.success(showSchedule, "Show schedule retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/search")
    public ResponseEntity<ApiResponse<Page<ShowScheduleResDTO>>> search(
            ShowScheduleSearchDTO searchDTO,
            @PageableDefault(size = 10, sort = "startTime", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<ShowScheduleResDTO> showSchedule = showScheduleService.searchSchedules(searchDTO, pageable);

        ApiResponse<Page<ShowScheduleResDTO>> pageApiResponse = ApiResponse.success(showSchedule, "");

        return ResponseEntity.ok(pageApiResponse);
    }

    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<ShowSchedule>> createShowSchedule(
            @Valid @RequestBody ShowScheduleCreateDTO createDTO) {

        // Gọi service xử lý logic (check phim, check room, check trùng lịch)
        ShowSchedule result = showScheduleService.createShowSchedule(createDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Tạo suất chiếu mới thành công!"));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<ShowSchedule>> updateShowSchedule(
            @PathVariable String id,
            @Valid @RequestBody ShowScheduleUpdateDTO dto) {

        ShowSchedule result = showScheduleService.update(id, dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Cập nhật suất chiếu thành công!"));
    }

    @GetMapping("/public/find-by-movie/{movieId}")
    public ResponseEntity<ApiResponse<List<CinemaShowtimeDTO>>> getShowtimes(
            @PathVariable String movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(ApiResponse.success(showScheduleService.getMovieShowtimes(movieId, date), ""));
    }

    @GetMapping("/booking-layout/{showScheduleId}")
    public ResponseEntity<ApiResponse<BookingLayoutDTO>> getLayout(@PathVariable String showScheduleId) {
        BookingLayoutDTO data = showScheduleService.getBookingLayout(showScheduleId);
        return ResponseEntity.ok(ApiResponse.success(data, ""));
    }

    @GetMapping("/public/get-show-time-on-date/{movieId}")
    public ResponseEntity<ApiResponse<List<ShowtimeDTO>>> getShowTimeOnDate(
            @PathVariable String movieId,
            @RequestParam String cinemaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<ShowtimeDTO> data =
                showScheduleService.getListShowTime(movieId, cinemaId, date);

        return ResponseEntity.ok(ApiResponse.success(data, ""));
    }

    @GetMapping("/public/get-available-dates/{movieId}")
    public ResponseEntity<ApiResponse<List<LocalDate>>> getShowTimeOnDate(
            @PathVariable String movieId
    ) {
        List<LocalDate> data =
                showScheduleService.getAvailableDates(movieId);
        return ResponseEntity.ok(ApiResponse.success(data, ""));
    }
}
