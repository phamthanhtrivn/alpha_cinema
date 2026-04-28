package com.movieticket.cinema.controller.internal;

import com.movieticket.cinema.dto.SelectionDTO;
import com.movieticket.cinema.service.CinemaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal/cinemas")
public class CinemaInternalController {
    @Autowired
    private CinemaService cinemaService;

    @PostMapping("/selections")
    public ResponseEntity<List<SelectionDTO>> getCinemaSelections(@RequestBody List<String> ids) {
        return ResponseEntity.ok(cinemaService.getCinemaSelectionsByIds(ids));
    }
}
