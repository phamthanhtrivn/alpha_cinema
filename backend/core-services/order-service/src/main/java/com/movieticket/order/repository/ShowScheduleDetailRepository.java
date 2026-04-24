package com.movieticket.order.repository;

import com.movieticket.order.entity.ShowScheduleDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShowScheduleDetailRepository extends JpaRepository<ShowScheduleDetail, Long> {

}
