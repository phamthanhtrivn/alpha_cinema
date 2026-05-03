package com.movieticket.order.controller;

import com.movieticket.order.common.ApiResponse;
import com.movieticket.order.dto.ShowScheduleDetailDTO;
import com.movieticket.order.entity.ShowScheduleDetail;
import com.movieticket.order.service.ShowScheduleDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/show-schedule-details")
public class ShowScheduleDetailController{
    @Autowired
    private ShowScheduleDetailService showScheduleDetailService;

    @GetMapping("/show-schedule-id/{id}")
    public ApiResponse<List<ShowScheduleDetailDTO>> getShowScheduleDetailsByShowScheduleId(@PathVariable("id") String showScheduleId) {
        List<ShowScheduleDetailDTO> showScheduleDetails = showScheduleDetailService.getShowScheduleDetailsByShowScheduleId(showScheduleId);
        return ApiResponse.success(showScheduleDetails, "Show schedule details retrieved successfully");
    }
}
