package com.movieticket.cinema.repository;

import com.movieticket.cinema.dto.SelectionDTO;
import com.movieticket.cinema.entity.ProjectionType;
import com.movieticket.cinema.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, String> {
    @Query("SELECT r.id as id, r.roomNumber as roomNumber, r.projectionType as projectionType " +
            "FROM Room r " +
            "WHERE r.cinema.id = :cinemaId " +
            "AND r.status = true " +
            "AND (:projections IS NULL OR r.projectionType IN :projections)")
    List<Object[]> findRawRoomOptions(
            @Param("cinemaId") String cinemaId,
            @Param("projections") List<ProjectionType> projections
    );
}
