package com.movieticket.order.repository;

import com.movieticket.order.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
	@EntityGraph(attributePaths = {"promotion", "orderDetails", "showScheduleDetails"})
	Optional<Order> findDetailedById(String id);

	@EntityGraph(attributePaths = {"promotion", "orderDetails", "showScheduleDetails"})
	List<Order> findDetailedByIdIn(Collection<String> ids);
}
