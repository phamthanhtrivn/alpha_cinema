package com.movieticket.cinema.controller.internal;

import com.movieticket.cinema.dto.CinemaRoomInfoDTO;
import com.movieticket.cinema.dto.SelectionDTO;
import com.movieticket.cinema.service.CinemaService;
import com.movieticket.cinema.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/cinemas")
public class CinemaInternalController {
    @Autowired
    private CinemaService cinemaService;
    @Autowired
    private RoomService roomService;
    @PostMapping("/selections")
    public ResponseEntity<List<SelectionDTO>> getCinemaSelections(@RequestBody List<String> ids) {
        return ResponseEntity.ok(cinemaService.getCinemaSelectionsByIds(ids));
    }

    @GetMapping("/location-info")
    public ResponseEntity<CinemaRoomInfoDTO> getLocationInfo(@RequestParam String roomId) {
        CinemaRoomInfoDTO data = roomService.getCinemaAndRoomName(roomId);
        return ResponseEntity.ok(data);
    }
}
