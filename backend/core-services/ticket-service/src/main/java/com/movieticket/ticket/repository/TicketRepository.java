package com.movieticket.ticket.repository;

import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.ProjectionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<TicketPrice, String> {
    boolean existsBySeatTypeIdAndProjectionTypeAndDayType(String seatTypeId, ProjectionType projectionType, DayType dayType);

    @Query("SELECT tp " +
            "FROM TicketPrice tp " +
            "ORDER BY tp.seatTypeId, tp.projectionType, tp.dayType")
    Page<TicketPrice> getAllPrices(Pageable pageable);
}
