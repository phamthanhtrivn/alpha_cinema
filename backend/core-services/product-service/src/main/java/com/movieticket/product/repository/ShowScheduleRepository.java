package com.movieticket.product.repository;

import com.movieticket.product.entity.ShowSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowScheduleRepository extends JpaRepository<ShowSchedule, String> {
}
