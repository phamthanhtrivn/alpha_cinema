package com.movieticket.product.repository;

import com.movieticket.product.dto.response.SelectionDTO;
import com.movieticket.product.entity.Movie;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, String>, JpaSpecificationExecutor<Movie> {
    @Query("SELECT new com.movieticket.product.dto.response.SelectionDTO(m.id, m.title) " +
            "FROM Movie m WHERE m.title LIKE %:query%")
    List<SelectionDTO> findMovieSuggestions(@Param("query") String query, Pageable pageable);
}
