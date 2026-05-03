package com.movieticket.cinema.service;

import com.movieticket.cinema.api_response.ApiResponse;
import com.movieticket.cinema.dto.*;
import com.movieticket.cinema.entity.Room;
import com.movieticket.cinema.entity.Seat;
import com.movieticket.cinema.entity.SeatType;
import com.movieticket.cinema.repository.RoomRepository;
import com.movieticket.cinema.repository.SeatRepository;
import com.movieticket.cinema.repository.SeatTypeRepository;
import com.movieticket.cinema.util.GenerateID;
import org.hibernate.sql.exec.ExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.function.Function;
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
    @Autowired
    private RestTemplate restTemplate;

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
                        s -> s));

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

    public List<SeatForShowScheduleResponse> getAllSeatsByShowSchedule(String showScheduleId, String roomID) {
        List<Seat> physicalSeats = seatRepository.findByRoomId(roomID);

        String url = "http://localhost:8082/api/show-schedule-details/show-schedule-id/" + showScheduleId;

        ResponseEntity<ApiResponse<List<ShowScheduleDetailDTO>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<List<ShowScheduleDetailDTO>>>() {
                });

        List<String> bookedSeatIds = new ArrayList<>();
        if (response.getBody() != null && response.getBody().getData() != null) {
            bookedSeatIds = response.getBody().getData().stream()
                    .map(ShowScheduleDetailDTO::getSeatId)
                    .collect(Collectors.toList());
        }

        List<String> finalBookedSeatIds = bookedSeatIds;
        return physicalSeats.stream().map(seat -> {
            String currentStatus = "AVAILABLE";

            if (finalBookedSeatIds.contains(seat.getId())) {
                currentStatus = "BOOKED";
            }

            return SeatForShowScheduleResponse.builder()
                    .id(seat.getId())
                    .rowName(seat.getRowName())
                    .columnName(seat.getColumnName())
                    .seatTypeId(seat.getSeatType().getId())
                    .seatTypeName(seat.getSeatType().getName())
                    .status(currentStatus)
                    .build();
        }).collect(Collectors.toList());
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
