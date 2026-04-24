package com.movieticket.ticket.controller;

import com.movieticket.ticket.common.ApiResponse;
import com.movieticket.ticket.dto.request.CreateHolidayDto;
import com.movieticket.ticket.dto.request.SearchHolidayDto;
import com.movieticket.ticket.dto.request.UpdateHolidayDto;
import com.movieticket.ticket.entity.Holiday;
import com.movieticket.ticket.service.HolidayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {
    private final HolidayService holidayService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Holiday>>> getHolidays(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @ModelAttribute SearchHolidayDto searchHolidayDto
    ) {
        Page<Holiday> holidays = holidayService.getAllHolidays(searchHolidayDto, PageRequest.of(page, size));
        ApiResponse<Page<Holiday>> response = ApiResponse.success(holidays, "Holidays retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Holiday>> getHolidayById(@PathVariable String id) {
        Holiday holiday = holidayService.getHolidayById(id);
        ApiResponse<Holiday> response = ApiResponse.success(holiday, "Holiday retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Holiday>> createHoliday(@Valid @RequestBody CreateHolidayDto createHolidayDto) {
        Holiday createdHoliday = holidayService.createHoliday(createHolidayDto);
        ApiResponse<Holiday> response = ApiResponse.success(createdHoliday, "Holiday created successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable String id) {
        holidayService.deleteHoliday(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Holiday deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Holiday>> updateHolidayTicketPrice(
            @PathVariable String id,
            @Valid @RequestBody UpdateHolidayDto updateDto) {
        Holiday updatedHoliday = holidayService.updateHoliday(id, updateDto);
        ApiResponse<Holiday> response = ApiResponse.success(updatedHoliday, "Holiday updated successfully");
        return ResponseEntity.ok(response);
    }
}
