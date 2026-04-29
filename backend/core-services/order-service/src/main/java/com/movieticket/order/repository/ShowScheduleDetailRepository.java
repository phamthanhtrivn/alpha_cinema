package com.movieticket.order.repository;

import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.entity.ShowScheduleDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ShowScheduleDetailRepository extends JpaRepository<ShowScheduleDetail, Long> {
    @Query("""
            select detail.seatId
            from ShowScheduleDetail detail
            join detail.order orderEntity
            where detail.showScheduleId = :showScheduleId
              and detail.seatId in :seatIds
              and orderEntity.status not in :releasedStatuses
            """)
    List<String> findReservedSeatIds(
            @Param("showScheduleId") String showScheduleId,
            @Param("seatIds") Collection<String> seatIds,
            @Param("releasedStatuses") Collection<OrderStatus> releasedStatuses
    );

    void deleteByOrder_Id(String orderId);
    @Query("SELECT d.seatId, d.showSeatType FROM ShowScheduleDetail d " +
            "WHERE d.showScheduleId = :showScheduleId " +
            "AND d.order.status != 'CANCELLED'")
    List<Object[]> findBookedSeatsInternal(@Param("showScheduleId") String showScheduleId);
}
