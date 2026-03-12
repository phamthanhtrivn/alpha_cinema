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
            "ORDER BY YEAR(h.startDate) DESC, MONTH(h.startDate) ASC ")
    Page<Holiday> getAllHolidays(Pageable pageable);

    boolean existsByStartDateAndEndDate(LocalDate startDate, LocalDate endDate);
}
