package com.movieticket.order.repository;

import com.movieticket.order.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, String> {
    Optional<Promotion> findByCodeIgnoreCase(String code);
}
