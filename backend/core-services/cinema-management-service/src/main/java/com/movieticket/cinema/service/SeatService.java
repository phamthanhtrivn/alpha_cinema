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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public List<Seat> createAndEditSeats(SeatRequest seatRequest) {
        Room room = roomRepository.findById(seatRequest.getRoomId())
                .orElseThrow(() -> new ExecutionException("Room khong ton tai"));
        SeatType seatType = seatTypeRepository.findById(seatRequest.getSeatTypeId())
                .orElseThrow(() -> new ExecutionException("Seat type khong ton tai"));

        List<Seat> existingSeatsInDb = seatRepository.findByRoomId(room.getId());

        Map<String, Seat> existingSeatMap = existingSeatsInDb.stream()
                .collect(Collectors.toMap(
                        s -> s.getRowName() + "-" + s.getColumnName(),
                        s -> s
                ));

        List<Seat> seatsToSave = seatRequest.getSeatItems().stream()
                .map(item -> {
                    String key = item.getRowName() + "-" + item.getColumnName();
                    Seat seat = existingSeatMap.getOrDefault(key, new Seat());

                    if (seat.getId() == null) {
                        seat.setId(GenerateID.generateSeatId(seatRequest.getRoomId()));
                    }

                    seat.setRowName(item.getRowName());
                    seat.setColumnName(item.getColumnName());
                    seat.setStatus(seatRequest.isStatus());
                    seat.setRoom(room);
                    seat.setSeatType(seatType);

                    return seat;
                }).toList();
        return seatRepository.saveAll(seatsToSave);
    }



}
