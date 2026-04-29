package com.movieticket.order.controller.internal;

import com.movieticket.order.dto.SeatTypeView;
import com.movieticket.order.entity.ShowScheduleDetail;
import com.movieticket.order.repository.ShowScheduleDetailRepository;
import com.movieticket.order.service.ShowScheduleDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.function.EntityResponse;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/internal/show-schedule-details")
public class ShowScheduleDetailInternalController {
    @Autowired
    private ShowScheduleDetailService detailService;

    @GetMapping("/booked-seats/{showScheduleId}")
    public ResponseEntity<Map<String, String>> getBookedSeats(@PathVariable String showScheduleId) {
        Map<String, String> bookedSeats = detailService.getBookedSeatMap(showScheduleId);

        return ResponseEntity.ok(bookedSeats);
    }
}
