package com.movieticket.cinema.repository;

import com.movieticket.cinema.entity.Cinema;
import com.movieticket.cinema.dto.CinemaSelectionProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, String> {
    List<CinemaSelectionProjection> findAllProjectedBy();
}
