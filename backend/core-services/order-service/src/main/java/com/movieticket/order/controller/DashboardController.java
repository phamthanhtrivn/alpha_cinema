package com.movieticket.order.controller;

import com.movieticket.order.common.ApiResponse;
import com.movieticket.order.service.DashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardAnalyticsService dashboardAnalyticsService;

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard(
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) String cinemaId
    ) {
        Map<String, Object> dashboard = dashboardAnalyticsService.getAdminDashboard(range, year, month, week, cinemaId);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Admin dashboard loaded successfully"));
    }

    @GetMapping("/manager")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getManagerDashboard(
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week,
            @RequestParam String cinemaId
    ) {
        Map<String, Object> dashboard = dashboardAnalyticsService.getManagerDashboard(range, year, month, week, cinemaId);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Manager dashboard loaded successfully"));
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStaffDashboard(
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week,
            @RequestParam String cinemaId,
            @RequestParam String employeeId
    ) {
        Map<String, Object> dashboard = dashboardAnalyticsService.getStaffDashboard(range, year, month, week, cinemaId, employeeId);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Staff dashboard loaded successfully"));
    }

    @GetMapping("/admin/{section}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboardSection(
            @PathVariable String section,
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) String cinemaId
    ) {
        Map<String, Object> dashboardSection = dashboardAnalyticsService.getAdminDashboardSection(
                section,
                range,
                year,
                month,
                week,
                cinemaId
        );
        return ResponseEntity.ok(ApiResponse.success(dashboardSection, "Admin dashboard section loaded successfully"));
    }
}
