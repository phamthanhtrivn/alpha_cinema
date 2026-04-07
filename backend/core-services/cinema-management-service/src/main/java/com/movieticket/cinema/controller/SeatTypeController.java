package com.movieticket.cinema.controller;

import com.movieticket.cinema.api_response.ApiResponse;
import com.movieticket.cinema.dto.SeatTypeRequest;
import com.movieticket.cinema.entity.SeatType;
import com.movieticket.cinema.service.SeatTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/seat-types")
public class SeatTypeController {
    @Autowired
    private SeatTypeService seatTypeService;

    @GetMapping
    public ApiResponse<List<SeatType>> getAllSeatTypes(){
        return new ApiResponse<>(true,seatTypeService.getAllSeatTypes());
    }

    @GetMapping("/{id}")
    public ApiResponse<SeatType> getSeatTypeById(@PathVariable String id){
        return new ApiResponse<>(true, seatTypeService.getSeatTypeById(id));
    }

    @PostMapping("/create")
    public ApiResponse<SeatType> createSeatType(@Validated @RequestBody SeatTypeRequest request){
        return new ApiResponse<>(true, seatTypeService.createSeatType(request));
    }

    @PutMapping("/edit/{id}")
    public ApiResponse<SeatType> editSeatType(@Validated @RequestBody SeatTypeRequest request, @PathVariable("id") String id){
        return new ApiResponse<>(true, seatTypeService.editSeatType(request, id));
    }


}
