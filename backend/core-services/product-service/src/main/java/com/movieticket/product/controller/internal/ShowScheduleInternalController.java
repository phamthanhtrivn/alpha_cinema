package com.movieticket.product.controller.internal;


import com.movieticket.product.dto.admin.response.ShowScheduleResDTO;
import com.movieticket.product.service.ShowScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal/show-schedules")
@RequiredArgsConstructor

public class ShowScheduleInternalController {
    private final ShowScheduleService showScheduleService;

    @PostMapping("/summary-batch")
    public ResponseEntity<List<ShowScheduleResDTO>> getBatchShowSchedules(@RequestBody List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<ShowScheduleResDTO> results = showScheduleService.getShowScheduleSummaryByIds(ids);
        return ResponseEntity.ok(results);
    }
}
