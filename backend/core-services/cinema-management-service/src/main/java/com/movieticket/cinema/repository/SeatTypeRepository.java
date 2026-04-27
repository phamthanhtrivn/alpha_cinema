package com.movieticket.cinema.repository;

import com.movieticket.cinema.entity.SeatType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatTypeRepository extends JpaRepository<SeatType, String> {
    Page<SeatType> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
