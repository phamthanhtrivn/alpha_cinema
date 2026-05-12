package com.movieticket.order.repository;

import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderDetail;
import com.movieticket.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByOrder_IdIn(Collection<String> orderIds);
    void deleteByOrderId(String orderId);
}