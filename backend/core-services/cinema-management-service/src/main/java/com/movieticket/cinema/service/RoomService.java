package com.movieticket.cinema.service;


import com.movieticket.cinema.dto.RoomRequest;
import com.movieticket.cinema.entity.Cinema;
import com.movieticket.cinema.entity.Room;
import com.movieticket.cinema.repository.CinemaRepository;
import com.movieticket.cinema.repository.RoomRepository;
import com.movieticket.cinema.repository.SeatRepository;
import com.movieticket.cinema.util.GenerateID;
import org.springframework.beans.factory.annotation.Autowired;
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

    public Room createRoom(RoomRequest request){
        Cinema cinema = CinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Cinema khong tim thay"));

        String id = GenerateID.generateRoomId();
        System.out.println(id);

        Room room = new Room(
                id,
                cinema,
                request.getRoomNumber(),
                request.getCatatity(),
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
        if(cnt > request.getCatatity()){
            throw new RuntimeException("Catatity nhỏ lớn số ghế hiện có");
        }
        room.setCinema(cinema);
        room.setRoomNumber(request.getRoomNumber());
        room.setCapacity(request.getCatatity());
        room.setProjectionType(request.getProjectionType());
        room.setStatus(request.isStatus());
        return roomRepository.save(room);
    }


}
