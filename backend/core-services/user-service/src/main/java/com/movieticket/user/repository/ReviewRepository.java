package com.movieticket.user.repository;

import com.movieticket.user.entity.Review;
import com.movieticket.user.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewRepository extends JpaRepository<Review, String>, JpaSpecificationExecutor<Review> {
    
    boolean existsByCustomerIdAndMovieId(String customerId, String movieId);

    Page<Review> findByMovieIdAndStatusOrderByCreatedAtDesc(String movieId, ReviewStatus status, Pageable pageable);
    
    interface ReviewStats {
        Long getTotalReviews();
        Double getTotalSumRating();
    }

    @Query("SELECT COUNT(r) as totalReviews, COALESCE(SUM(r.rating), 0.0) as totalSumRating FROM Review r WHERE r.movieId = :movieId AND r.status = 'APPROVED'")
    ReviewStats getReviewStatsByMovieId(@Param("movieId") String movieId);


    Page<Review> findByCustomerIdOrderByCreatedAtDesc(String customerId, Pageable pageable);
}
