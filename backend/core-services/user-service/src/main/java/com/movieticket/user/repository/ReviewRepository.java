package com.movieticket.user.repository;

import com.movieticket.user.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, String> {
    
    boolean existsByCustomerIdAndMovieId(String customerId, String movieId);
    
    interface ReviewStats {
        Long getTotalReviews();
        Double getTotalSumRating();
    }

    @Query("SELECT COUNT(r) as totalReviews, COALESCE(SUM(r.rating), 0.0) as totalSumRating FROM Review r WHERE r.movieId = :movieId AND r.status = 'APPROVED'")
    ReviewStats getReviewStatsByMovieId(@Param("movieId") String movieId);
}
