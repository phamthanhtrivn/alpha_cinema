package com.movieticket.cinema.service;

import com.movieticket.cinema.dto.SeatRequest;
import com.movieticket.cinema.entity.Room;
import com.movieticket.cinema.entity.Seat;
import com.movieticket.cinema.entity.SeatType;
import com.movieticket.cinema.repository.RoomRepository;
import com.movieticket.cinema.repository.SeatRepository;
import com.movieticket.cinema.repository.SeatTypeRepository;
import com.movieticket.cinema.util.GenerateID;
import org.hibernate.sql.exec.ExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatService {
    @Autowired
    private SeatRepository seatRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private SeatTypeRepository seatTypeRepository;

    public List<Seat> getAllSeatsByRoom(String id) {
        return seatRepository.findByRoom_Id(id);
    }

    public List<Seat> createSeats(SeatRequest seatRequest) {
        Room room = roomRepository.findById(seatRequest.getRoomId())
                .orElseThrow(() -> new ExecutionException("Room khong ton tai"));
        SeatType seatType = seatTypeRepository.findById(seatRequest.getSeatTypeId())
                .orElseThrow(() -> new ExecutionException("Seat type khong ton tai"));

        List<Seat> seats = seatRequest.getSeatItems()
                .stream()
                .map(item -> Seat.builder()
                        .id(GenerateID.generateSeatId())
                        .room(room)
                        .seatType(seatType)
                        .rowName(item.getRowName())
                        .columnName(item.getColumnName())
                        .status(seatRequest.isStatus())
                        .build()
                ).toList();
        return seatRepository.saveAll(seats);
    }



}
