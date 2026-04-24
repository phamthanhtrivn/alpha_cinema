package com.movieticket.cinema.repository;

import com.movieticket.cinema.entity.Cinema;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, String> {

    @Query("""
        SELECT c FROM Cinema c
        WHERE (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
        AND (:address IS NULL OR LOWER(c.address) LIKE LOWER(CONCAT('%', :address, '%')))
        AND (:phone IS NULL OR c.phone = :phone)
        AND (:status IS NULL OR c.status = :status)
    """)
    Page<Cinema> filterCinemas(
            @Param("name") String name,
            @Param("address") String address,
            @Param("phone") String phone,
            @Param("status") Boolean status,
            Pageable pageable
    );
}
