package com.movieticket.cinema.controller;

import com.movieticket.cinema.api_response.ApiResponse;
import com.movieticket.cinema.dto.RoomDetailDTO;
import com.movieticket.cinema.dto.RoomRequest;
import com.movieticket.cinema.dto.SelectionDTO;
import com.movieticket.cinema.entity.ProjectionType;
import com.movieticket.cinema.entity.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.movieticket.cinema.dto.RoomRequest;
import com.movieticket.cinema.entity.Room;
import com.movieticket.cinema.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;
    
    @GetMapping
    public ApiResponse<List<Room>> getAllRooms(){
        try{
            return new ApiResponse<>(true, roomService.getAllRooms());
        }
        catch (Exception e){
            System.out.println(e);
            return new ApiResponse<>(false,e.getMessage());
        }
    }
    @GetMapping("/page")
    public ApiResponse<Page<Room>> getAllRoomsandPage(
            @RequestParam(required = false) String cinemaId,
            @RequestParam(required = false) Integer roomNumber,
            @RequestParam(required = false) String projectionType,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ){
        try{
            return new ApiResponse<>(true, roomService.getAllRoomsAndPage(cinemaId, roomNumber, projectionType, status, page, size));
        }
        catch (Exception e){
            System.out.println(e);
            return new ApiResponse<>(false,e.getMessage());
        }
    }


    @PostMapping("/create")
    public ApiResponse<Room>createRoom(@Validated @RequestBody RoomRequest request){
        System.out.println(request.toString());
        try{
            return new ApiResponse<>(true, roomService.createRoom(request));
        }
        catch (RuntimeException e){
            System.out.println(e);
            return new ApiResponse<>(false, e.getMessage());
        } catch (Exception e) {
            System.out.println(e);
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @PutMapping("/edit/{id}")
    public ApiResponse<Room> editRoom(@Validated @RequestBody RoomRequest request, @PathVariable String id){
        try{
            return new ApiResponse<>(true,roomService.updateRoom(request,id));
        } catch (RuntimeException e) {
           return new ApiResponse<>(false, e.getMessage());
        }
        catch (Exception e){
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Room> getRoomById(@PathVariable String id) {
        try {
            return new ApiResponse<>(true, roomService.getRoomById(id));
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
}
