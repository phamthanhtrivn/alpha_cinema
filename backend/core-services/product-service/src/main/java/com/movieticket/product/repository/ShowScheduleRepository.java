package com.movieticket.product.repository;

import com.movieticket.product.entity.Movie;
import com.movieticket.product.dto.client.ShowScheduleView;
import com.movieticket.product.dto.client.ShowTimeView;
import com.movieticket.product.entity.ShowSchedule;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    @Query("SELECT s FROM ShowSchedule s WHERE s.movie.id = :movieId " +
            "AND CAST(s.startTime AS date) = :date " +
            "AND s.status = true")
    List<ShowScheduleView> findAllByMovieIdAndDate(
            @Param("movieId") String movieId,
            @Param("date") LocalDate date
    );

    @Query("SELECT s.id AS id, s.startTime AS startTime FROM ShowSchedule s " +
            "WHERE s.movie.id = :movieId " +
            "AND s.cinemaId = :cinemaId " +
            "AND CAST(s.startTime AS date) = :date " +
            "ORDER BY s.startTime ASC")
    List<ShowTimeView> findShowtimesByMovieAndCinemaAndDate(
            @Param("movieId") String movieId,
            @Param("cinemaId") String cinemaId,
            @Param("date") LocalDate date
    );

    @Query("SELECT DISTINCT CAST(s.startTime AS date) FROM ShowSchedule s " +
            "WHERE s.movie.id = :movieId AND s.startTime >= CURRENT_TIMESTAMP " +
            "ORDER BY 1")
    List<Date> getAvailableDatesByMovie(@Param("movieId") String movieId);


     @Query("SELECT s FROM ShowSchedule s " +
            "JOIN FETCH s.movie " +
            "WHERE s.cinemaId = :cinemaId " +
            "AND s.startTime <= :endOfShift " +
            "AND s.status = true " +
            "ORDER BY s.startTime ASC")
    List<ShowSchedule> findAllSchedulesWithMovieForShift(
            @Param("cinemaId") String cinemaId,
            @Param("endOfShift") LocalDateTime endOfShift
    );

    @Query("SELECT DISTINCT s.cinemaId FROM ShowSchedule s " +
            "WHERE s.movie.id = :movieId AND s.startTime >= CURRENT_TIMESTAMP")
    List<String> findActiveCinemaIdsByMovie(@Param("movieId") String movieId);

    @Query("SELECT DISTINCT CAST(s.startTime AS date) FROM ShowSchedule s " +
            "WHERE s.movie.id = :movieId AND s.cinemaId = :cinemaId " +
            "AND s.startTime >= CURRENT_TIMESTAMP " +
            "ORDER BY 1 ASC")
    List<java.sql.Date> findActiveDatesByMovieAndCinema(
            @Param("movieId") String movieId,
            @Param("cinemaId") String cinemaId);

    @Query("SELECT s FROM ShowSchedule s JOIN FETCH s.movie WHERE s.id IN :ids")
    List<ShowSchedule> findAllByIdWithMovie(@Param("ids") List<String> ids);

    @Query("""
            SELECT s FROM ShowSchedule s JOIN FETCH s.movie
            WHERE s.status = true
            AND s.startTime >= :start
            AND s.startTime < :endExclusive
            AND (:movieTitle IS NULL OR LOWER(s.movie.title) LIKE LOWER(CONCAT('%', :movieTitle, '%')))
            AND (:cinemaId IS NULL OR s.cinemaId = :cinemaId)
            ORDER BY s.startTime ASC
            """)
    List<ShowSchedule> findPublicSchedulesInRange(
            @Param("start") LocalDateTime start,
            @Param("endExclusive") LocalDateTime endExclusive,
            @Param("movieTitle") String movieTitle,
            @Param("cinemaId") String cinemaId,
            Pageable pageable
    );
}
