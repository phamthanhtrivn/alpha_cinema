package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.service.ProductDashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/products/dashboard")
@RequiredArgsConstructor
public class ProductDashboardController {
    private final ProductDashboardAnalyticsService productDashboardAnalyticsService;

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard(
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) String cinemaId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                productDashboardAnalyticsService.getDashboard(range, year, month, week, cinemaId),
                "Product dashboard loaded successfully"
        ));
    }
}
