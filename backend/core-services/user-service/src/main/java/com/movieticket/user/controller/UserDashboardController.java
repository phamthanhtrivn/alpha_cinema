package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.service.UserDashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users/dashboard")
@RequiredArgsConstructor
public class UserDashboardController {
    private final UserDashboardAnalyticsService userDashboardAnalyticsService;

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard(
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) String cinemaId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userDashboardAnalyticsService.getDashboard(range, year, month, week, cinemaId),
                "User dashboard loaded successfully"
        ));
    }
}
