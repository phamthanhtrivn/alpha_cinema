package com.movieticket.payment.controller;

import com.movieticket.payment.common.ApiResponse;
import com.movieticket.payment.service.PaymentDashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/dashboard")
@RequiredArgsConstructor
public class PaymentDashboardController {
    private final PaymentDashboardAnalyticsService paymentDashboardAnalyticsService;

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard(
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentDashboardAnalyticsService.getDashboard(range, year, month, week),
                "Payment dashboard loaded successfully"
        ));
    }
}
