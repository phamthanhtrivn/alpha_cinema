package com.movieticket.cinema.service;


import com.movieticket.cinema.dto.RoomRequest;
import com.movieticket.cinema.entity.Cinema;
import com.movieticket.cinema.entity.ProjectionType;
import com.movieticket.cinema.entity.Room;
import com.movieticket.cinema.repository.CinemaRepository;
import com.movieticket.cinema.repository.RoomRepository;
import com.movieticket.cinema.repository.SeatRepository;
import com.movieticket.cinema.util.GenerateID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private CinemaRepository CinemaRepository;
    @Autowired
    private SeatRepository seatRepository;

    public List<Room> getAllRooms(){
        try{
            return roomRepository.findAll();
        }
        catch(Exception e){
            System.out.println(e);
        }
        return null;
    }

    public Page<Room> getAllRoomsAndPage(String cinemaId, Integer roomNumber, String projectionType, Boolean status, int page, int size){
        try{
            return roomRepository.filterCinemas(
                    cinemaId,
                    roomNumber,
                    projectionType != null ? ProjectionType.valueOf(projectionType) : null,
                    status,
                    PageRequest.of(page, size)
            );
        }
        catch(Exception e){
            System.out.println(e);
        }
        return null;
    }

    public Room createRoom(RoomRequest request){
        Cinema cinema = CinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Cinema khong tim thay"));
        // kiem tra roomNumber trong 1 cinema da ton tai chua
        Room existingRoom = roomRepository.findByCinema_IdAndRoomNumber(request.getCinemaId(), request.getRoomNumber());
        if(existingRoom != null){
            throw new RuntimeException("Room number đã tồn tại trong cinema này");
        }

        String id = GenerateID.generateRoomId();
        System.out.println(id);

        Room room = new Room(
                id,
                cinema,
                request.getRoomNumber(),
                request.getCapacity(),
                request.getProjectionType(),
                request.isStatus()
        );
        return roomRepository.save(room);
    }

    public Room updateRoom(RoomRequest request,String id){
        Cinema cinema = CinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Cinema khong tim thay"));
        Room room = roomRepository.findById(id).orElseThrow(() -> new RuntimeException("Room khong tim thay"));
        int cnt = seatRepository.countByRoom_Id(room.getId());
        if(cnt > request.getCapacity()){
            throw new RuntimeException("Catatity nhỏ lớn số ghế hiện có");
        }
        room.setCinema(cinema);
        room.setRoomNumber(request.getRoomNumber());
        room.setCapacity(request.getCapacity());
        room.setProjectionType(request.getProjectionType());
        room.setStatus(request.isStatus());
        return roomRepository.save(room);
    }


}
