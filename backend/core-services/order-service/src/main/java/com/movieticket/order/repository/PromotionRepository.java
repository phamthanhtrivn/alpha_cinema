package com.movieticket.order.repository;

import com.movieticket.order.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion,String> {
    Page<Promotion> findByCodeContainingIgnoreCase(String code, Pageable pageable);
}
