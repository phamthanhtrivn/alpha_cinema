package com.movieticket.cinema.repository;

import com.movieticket.cinema.entity.Room;
import com.movieticket.cinema.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, String> {
    int countByRoom_Id(String roomId);
    List<Seat> findByRoom_Id(String roomId);
    Seat findByRoom_IdAndRowNameAndColumnName(String roomId, String rowName, String columnName);
    List<Seat> findByRoomId(String id);

    @Query("SELECT s.id, s.rowName, s.columnName, t.id ,t.name, s.status " +
            "FROM Seat s JOIN s.seatType t " +
            "WHERE s.room.id = :roomId")
    List<Object[]> findAllPhysicalSeatsByRoom(@Param("roomId") String roomId);
    List<Seat> findByIdIn(List<String> ids);
}
