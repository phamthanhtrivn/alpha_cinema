package com.movieticket.order.repository;

import com.movieticket.order.dto.SeatTypeView;
import com.movieticket.order.entity.ShowScheduleDetail;
import com.movieticket.order.entity.ShowSeatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface ShowScheduleDetailRepository extends JpaRepository<ShowScheduleDetail, Long> {
    @Query("SELECT d.seatId, d.showSeatType FROM ShowScheduleDetail d " +
            "WHERE d.showScheduleId = :showScheduleId " +
            "AND d.order.status != 'CANCELLED'")
    List<Object[]> findBookedSeatsInternal(@Param("showScheduleId") String showScheduleId);
}
