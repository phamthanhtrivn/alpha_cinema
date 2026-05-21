package com.movieticket.ai.controller;

import com.movieticket.ai.common.ApiResponse;
import com.movieticket.ai.dto.response.AiDashboardResponse;
import com.movieticket.ai.dto.response.PopularQuestionResponse;
import com.movieticket.ai.service.AiAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai/analytics")
@RequiredArgsConstructor
public class AiAnalyticsController {

    private final AiAnalyticsService aiAnalyticsService;

    @GetMapping("/dashboard")
    public ApiResponse<AiDashboardResponse> dashboard(
            @RequestParam(defaultValue = "month") String range,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week
    ) {
        AiDashboardResponse response = aiAnalyticsService.getDashboard(range, year, month, week);
        return ApiResponse.success(response, "Fetched AI dashboard analytics successfully");
    }

    @GetMapping("/popular-questions")
    public ApiResponse<List<PopularQuestionResponse>> popularQuestions(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<PopularQuestionResponse> response = aiAnalyticsService.getPopularQuestions(limit);
        return ApiResponse.success(response, "Fetched popular AI questions successfully");
    }
}
