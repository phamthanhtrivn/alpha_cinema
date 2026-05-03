package com.movieticket.order.repository;


import com.movieticket.order.entity.OrderDetail;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDataiReposioty extends JpaRepository<OrderDetail, Long> {
    @Transactional
    void deleteByOrderId(String orderId);
}
