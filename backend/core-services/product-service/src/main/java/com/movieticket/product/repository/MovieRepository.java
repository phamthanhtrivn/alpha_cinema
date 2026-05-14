package com.movieticket.product.repository;

import com.movieticket.product.dto.admin.response.SelectionDTO;
import com.movieticket.product.entity.Movie;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, String>, JpaSpecificationExecutor<Movie> {
    @Query("SELECT new com.movieticket.product.dto.admin.response.SelectionDTO(m.id, m.title) " +
            "FROM Movie m WHERE m.title LIKE %:query%")
    List<SelectionDTO> findMovieSuggestions(@Param("query") String query, Pageable pageable);

    @Modifying
    @Query("UPDATE Movie m SET m.totalReviews = :totalReviews, m.totalSumRating = :totalSumRating, m.avgRating = :avgRating WHERE m.id = :id AND (m.totalReviews IS NULL OR m.totalReviews <= :totalReviews)")
    int updateRatingInfo(@Param("id") String id, @Param("totalReviews") Long totalReviews, @Param("totalSumRating") Double totalSumRating, @Param("avgRating") double avgRating);
}
