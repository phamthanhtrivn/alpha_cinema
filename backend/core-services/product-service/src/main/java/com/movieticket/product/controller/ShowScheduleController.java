package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.dto.response.ShowScheduleLookupDto;
import com.movieticket.product.service.ShowScheduleLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/show-schedules")
@RequiredArgsConstructor
public class ShowScheduleController {
    private final ShowScheduleLookupService showScheduleLookupService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowScheduleLookupDto>> getShowScheduleById(@PathVariable String id) {
        ShowScheduleLookupDto showSchedule = showScheduleLookupService.getShowScheduleById(id);
        ApiResponse<ShowScheduleLookupDto> response = ApiResponse.success(showSchedule, "Show schedule retrieved successfully");
        return ResponseEntity.ok(response);
    }
}
