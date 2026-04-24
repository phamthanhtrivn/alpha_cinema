package com.movieticket.cinema.controller;

import com.movieticket.cinema.api_response.ApiResponse;
import com.movieticket.cinema.dto.CinemaRequest;
import com.movieticket.cinema.entity.Cinema;
import com.movieticket.cinema.service.CinemaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cinemas")
public class CinemaController {
    @Autowired
    private CinemaService cinemaService;

    @GetMapping public ApiResponse<List<Cinema>> getAllCinemas() {
        List<Cinema> list = cinemaService.getAllCinemas();
        return new ApiResponse<>(true, list);
    }

    @GetMapping("/page")
    public ApiResponse<Page<Cinema>> getAllCinemas(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        try {
            Page<Cinema> cinemas = cinemaService.getAllCinemasAndPage(name, address, phone, status, page, size);
            return new ApiResponse<>(true, cinemas);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @PostMapping("/create")
    public ApiResponse<Cinema>  createCinema(@Valid @RequestBody CinemaRequest request) {
            Cinema cinema = cinemaService.createCinema(request);
            return new ApiResponse<>(true, cinema);
    }

    @PutMapping("/edit/{id}")
    public ApiResponse<Cinema>  editCinema(@Valid @RequestBody CinemaRequest request, @PathVariable("id") String id) {
        Cinema cinema = cinemaService.editCinema(request, id);
        return new ApiResponse<>(true, cinema);
    }

}
