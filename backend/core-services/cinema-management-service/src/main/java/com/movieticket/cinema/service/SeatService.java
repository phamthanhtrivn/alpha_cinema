package com.movieticket.cinema.service;

import com.movieticket.cinema.dto.SeatRequest;
import com.movieticket.cinema.dto.SeatResponseToProduct;
import com.movieticket.cinema.dto.SeatLookupDto;
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

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
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

    public List<SeatLookupDto> getSeatsByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        List<String> normalizedIds = ids.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .collect(Collectors.collectingAndThen(Collectors.toCollection(LinkedHashSet::new), List::copyOf));

        if (normalizedIds.isEmpty()) {
            return List.of();
        }

        Map<String, Seat> seatsById = seatRepository.findByIdIn(normalizedIds)
                .stream()
                .collect(Collectors.toMap(Seat::getId, Function.identity(), (first, second) -> first));

        return normalizedIds.stream()
                .map(id -> {
                    Seat seat = seatsById.get(id);
                    if (seat == null) {
                        return null;
                    }

                    return SeatLookupDto.builder()
                            .id(seat.getId())
                            .roomId(seat.getRoom() == null ? null : seat.getRoom().getId())
                            .rowName(seat.getRowName())
                            .columnName(seat.getColumnName())
                            .seatTypeId(seat.getSeatType() == null ? null : seat.getSeatType().getId())
                            .status(seat.isStatus())
                            .build();
                })
                .filter(seat -> seat != null)
                .toList();
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
                        seat.setId(GenerateID.generateSeatId());
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
    //Hà Thanh Tuấn
    public List<SeatResponseToProduct> getSeatsByRoom(String roomId) {
        List<Object[]> results = seatRepository.findAllPhysicalSeatsByRoom(roomId);

        return results.stream().map(row -> SeatResponseToProduct.builder()
                        .seatId((String) row[0])
                        .rowName((String) row[1])
                        .columnName((String) row[2])
                        .seatTypeId((String) row[3])
                        .seatType((String) row[4])
                        .isUsable((Boolean) row[5])
                        .build())
                .toList();
    }

}
