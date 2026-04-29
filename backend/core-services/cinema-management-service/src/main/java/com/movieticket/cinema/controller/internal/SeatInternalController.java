package com.movieticket.cinema.controller.internal;

import com.movieticket.cinema.dto.SeatResponseToProduct;
import com.movieticket.cinema.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/seats")

public class SeatInternalController {
    @Autowired
    private SeatService seatService;

    @GetMapping("/seat-by-room/{id}")
    public ResponseEntity<List<SeatResponseToProduct>> getSeatByRoom(@PathVariable String id) {
        return ResponseEntity.ok(seatService.getSeatsByRoom(id));
    }
}
