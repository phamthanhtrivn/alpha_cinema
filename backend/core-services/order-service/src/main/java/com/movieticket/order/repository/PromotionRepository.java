package com.movieticket.order.repository;

import com.movieticket.order.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, String> {
    Optional<Promotion> findByCodeIgnoreCase(String code);
    Page<Promotion> findByCodeContainingIgnoreCase(String code, Pageable pageable);
}