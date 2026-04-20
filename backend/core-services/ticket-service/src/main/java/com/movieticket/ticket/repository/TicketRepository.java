package com.movieticket.ticket.repository;

import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.ProjectionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<TicketPrice, String> {
    boolean existsBySeatTypeIdAndProjectionTypeAndDayType(String seatTypeId, ProjectionType projectionType, DayType dayType);

<<<<<<< HEAD
=======
    boolean existsBySeatTypeIdAndProjectionTypeAndDayTypeAndIdNot(String seatTypeId, ProjectionType projectionType, DayType dayType, String id);

>>>>>>> 8dcf4ad36f4973cbda6589a0926d134dc3149b6a
    @Query("SELECT tp " +
            "FROM TicketPrice tp " +
            "WHERE (:id IS NULL OR tp.id = :id) " +
            "AND (:seatTypeId IS NULL OR tp.seatTypeId = :seatTypeId) " +
            "AND (:projectionType IS NULL OR tp.projectionType = :projectionType) " +
            "AND (:dayType IS NULL OR tp.dayType = :dayType) " +
            "AND (:minPrice IS NULL OR tp.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR tp.price <= :maxPrice) " +
            "AND (:status IS NULL OR tp.status = :status) " +
            "ORDER BY tp.seatTypeId, tp.projectionType, tp.dayType")
    Page<TicketPrice> getAllPrices(
            @Param("id") String id,
            @Param("seatTypeId") String seatTypeId,
            @Param("projectionType") ProjectionType projectionType,
            @Param("dayType") DayType dayType,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("status") Boolean status,
            Pageable pageable
    );

    TicketPrice findBySeatTypeIdAndProjectionTypeAndDayTypeAndStatus(String seatTypeId, ProjectionType projectionType, DayType dayType, boolean status);
}
