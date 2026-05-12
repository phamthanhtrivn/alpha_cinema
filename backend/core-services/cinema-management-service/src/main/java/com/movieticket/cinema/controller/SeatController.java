package com.movieticket.cinema.controller;

import com.movieticket.cinema.api_response.ApiResponse;
import com.movieticket.cinema.dto.InfoBookingResponse;
import com.movieticket.cinema.dto.SeatLookupDto;
import com.movieticket.cinema.dto.SeatForShowScheduleResponse;
import com.movieticket.cinema.dto.SeatRequest;
import com.movieticket.cinema.entity.Seat;
import com.movieticket.cinema.service.SeatService;
import org.hibernate.sql.exec.ExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.EntityResponse;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
public class SeatController {
    @Autowired
    private SeatService seatService;

    @GetMapping("/{id}")
    public ApiResponse<List<Seat>> getAllSeatsByRoom(@PathVariable String id){
        try{
            return new ApiResponse<>(true, seatService.getAllSeatsByRoom(id));
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @PostMapping("/createAndUpdate")
    public ApiResponse<List<Seat>> createSeat(@Validated @RequestBody SeatRequest seatRequest){
        try{
            return new ApiResponse<>(true, seatService.createAndEditSeats(seatRequest));
        } catch (ExecutionException e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @PostMapping("/batch")
    public ApiResponse<List<SeatLookupDto>> getSeatsByIds(@RequestBody List<String> ids){
        try {
            return new ApiResponse<>(true, seatService.getSeatsByIds(ids));
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @GetMapping("/showSchedule")
    public ApiResponse<List<SeatForShowScheduleResponse>> getAllSeatsByShowSchedule(
            @RequestParam(required = true) String showScheduleId,
            @RequestParam(required = true) String roomId
    ){
        try{
            return new ApiResponse<>(true, seatService.getAllSeatsByShowSchedule(showScheduleId, roomId));
        } catch (ExecutionException e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @GetMapping("/get-info-for-booking")
    public ResponseEntity<ApiResponse<InfoBookingResponse>> getInfoForBooking(
            @RequestParam(required = true) List<String> seatIds
    ){
        return ResponseEntity.ok().body(new ApiResponse<>(true, seatService.getInfoForBooking(seatIds)));
    }
}

