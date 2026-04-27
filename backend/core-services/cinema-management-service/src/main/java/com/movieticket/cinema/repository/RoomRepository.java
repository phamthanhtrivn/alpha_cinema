package com.movieticket.cinema.repository;

import com.movieticket.cinema.entity.Cinema;
import com.movieticket.cinema.entity.ProjectionType;
import com.movieticket.cinema.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("""
        SELECT r FROM Room r
        WHERE (:cinemaId IS NULL OR r.cinema.id = :cinemaId)
        AND (:roomNumber IS NULL OR r.roomNumber = :roomNumber)
        AND (:projectionType IS NULL OR r.projectionType = :projectionType)
        AND (:status IS NULL OR r.status = :status)
    """)
    Page<Room> filterCinemas(
            @Param("cinemaId") String cinemaId,
            @Param("roomNumber") Integer roomNumber,
            @Param("projectionType") ProjectionType projectionType,
            @Param("status") Boolean status,
            Pageable pageable
    );

    Room findByCinema_IdAndRoomNumber(String cinemaId, Integer roomNumber);

}
