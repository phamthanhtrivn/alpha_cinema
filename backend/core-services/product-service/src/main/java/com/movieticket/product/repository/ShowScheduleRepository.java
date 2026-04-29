package com.movieticket.product.repository;

import com.movieticket.product.entity.Movie;
import com.movieticket.product.entity.ShowSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ShowScheduleRepository extends JpaRepository<ShowSchedule, String>, JpaSpecificationExecutor<ShowSchedule> {
    @Query("SELECT COUNT(s) > 0 FROM ShowSchedule s WHERE s.roomId = :roomId " +
            "AND s.status = true " +
            "AND s.startTime < :endTime AND s.endTime > :startTime")
    boolean existsOverlap(String roomId, LocalDateTime startTime, LocalDateTime endTime);

    @Query("SELECT COUNT(s) > 0 FROM ShowSchedule s WHERE s.roomId = :roomId " +
            "AND s.id != :excludeId " +
            "AND s.status = true " +
            "AND s.startTime < :endTime AND s.endTime > :startTime")
    boolean existsOverlapExcludeId(String roomId, LocalDateTime startTime, LocalDateTime endTime, String excludeId);
}
