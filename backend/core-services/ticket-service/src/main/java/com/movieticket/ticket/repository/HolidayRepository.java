package com.movieticket.ticket.repository;

import com.movieticket.ticket.entity.Holiday;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, String> {
    @Query("""
        SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END
        FROM Holiday h
        WHERE :date BETWEEN h.startDate AND h.endDate
    """)
    boolean isHoliday(@Param("date") LocalDate date);

    @Query("SELECT h " +
            "FROM Holiday h " +
            "WHERE (:id IS NULL OR h.id = :id) " +
            "AND (:name IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:startDateFrom IS NULL OR h.startDate >= :startDateFrom) " +
            "AND (:startDateTo IS NULL OR h.startDate <= :startDateTo) " +
            "AND (:endDateFrom IS NULL OR h.endDate >= :endDateFrom) " +
            "AND (:endDateTo IS NULL OR h.endDate <= :endDateTo) " +
            "AND (:status IS NULL OR h.status = :status) " +
            "ORDER BY h.startDate ASC ")
    Page<Holiday> getAllHolidays(
            @Param("id") String id,
            @Param("name") String name,
            @Param("startDateFrom") LocalDate startDateFrom,
            @Param("startDateTo") LocalDate startDateTo,
            @Param("endDateFrom") LocalDate endDateFrom,
            @Param("endDateTo") LocalDate endDateTo,
            @Param("status") Boolean status,
            Pageable pageable
    );

    boolean existsByStartDateAndEndDate(LocalDate startDate, LocalDate endDate);

    boolean existsByStartDateAndEndDateAndIdNot(LocalDate startDate, LocalDate endDate, String id);
}
