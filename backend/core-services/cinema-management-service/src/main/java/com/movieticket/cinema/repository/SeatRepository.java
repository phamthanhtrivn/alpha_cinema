package com.movieticket.cinema.repository;

import com.movieticket.cinema.entity.Room;
import com.movieticket.cinema.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, String> {
    int countByRoom_Id(String roomId);
    List<Seat> findByRoom_Id(String roomId);
    Seat findByRoom_IdAndRowNameAndColumnName(String roomId, String rowName, String columnName);
    List<Seat> findByRoomId(String id);
    List<Seat> findByIdIn(List<String> ids);
}
