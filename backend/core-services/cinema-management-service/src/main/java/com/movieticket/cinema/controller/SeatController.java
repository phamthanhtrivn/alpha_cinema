package com.movieticket.cinema.controller;

import com.movieticket.cinema.api_response.ApiResponse;
import com.movieticket.cinema.dto.SeatRequest;
import com.movieticket.cinema.entity.Seat;
import com.movieticket.cinema.service.SeatService;
import org.hibernate.sql.exec.ExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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

}
