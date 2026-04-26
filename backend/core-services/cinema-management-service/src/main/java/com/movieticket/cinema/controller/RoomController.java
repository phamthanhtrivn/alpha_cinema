package com.movieticket.cinema.controller;

import com.movieticket.cinema.api_response.ApiResponse;
import com.movieticket.cinema.dto.RoomDetailDTO;
import com.movieticket.cinema.dto.RoomRequest;
import com.movieticket.cinema.dto.SelectionDTO;
import com.movieticket.cinema.entity.ProjectionType;
import com.movieticket.cinema.entity.Room;
import com.movieticket.cinema.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @GetMapping
    public ApiResponse<List<Room>> getAllRooms() {
        try {
            return new ApiResponse<>(true, roomService.getAllRooms());
        } catch (Exception e) {
            System.out.println(e);
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @PostMapping("/create")
    public ApiResponse<Room> createRoom(@Validated @RequestBody RoomRequest request) {
        try {
            return new ApiResponse<>(true, roomService.createRoom(request));
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @PutMapping("/edit/{id}")
    public ApiResponse<Room> editRoom(@Validated @RequestBody RoomRequest request, @PathVariable String id) {
        try {
            return new ApiResponse<>(true, roomService.updateRoom(request, id));
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @GetMapping("/options")
    public ResponseEntity<ApiResponse<List<SelectionDTO>>> getRoomOptions(@RequestParam String cinemaId, @RequestParam(required = false) List<ProjectionType> projections) {
        System.out.println(projections);
        List<SelectionDTO> options = roomService.getRoomOptions(cinemaId, projections);
        return ResponseEntity.ok(new ApiResponse<>(true, options));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomDetailDTO>> findById(@PathVariable String id) {
        Room room = roomService.findById(id);

        RoomDetailDTO roomDetail = RoomDetailDTO.builder()
                .id(room.getId())
                .cinemaId(room.getCinema().getId())
                .roomNumber(room.getRoomNumber())
                .projectionType(room.getProjectionType())
                .capacity(room.getCapacity())
                .status(room.isStatus())
                .build();

        return ResponseEntity.ok(new ApiResponse<>(true, roomDetail));
    }
}
