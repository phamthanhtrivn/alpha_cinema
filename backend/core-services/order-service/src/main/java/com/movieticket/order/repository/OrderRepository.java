package com.movieticket.order.repository;

import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

	Optional<Order> findByIdAndCinemaIdAndStatus(String id, String cinemaId, OrderStatus status);
	Optional<Order> findByIdAndCinemaIdAndStatusIn(String id, String cinemaId, Collection<OrderStatus> statuses);
	@EntityGraph(attributePaths = {"showScheduleDetails"})
    List<Order> findTop20ByCustomerIdAndStatusInOrderByCreatedAtDesc(
            String customerId,
            List<OrderStatus> statuses
    );

	@Query("SELECT o.status FROM Order o " +
			"JOIN o.showScheduleDetails s " +
			"WHERE o.customerId = :customerId AND s.movieId = :movieId")
	List<OrderStatus> findOrderStatusesByCustomerAndMovie(
			@Param("customerId") String customerId,
			@Param("movieId") String movieId);
}
