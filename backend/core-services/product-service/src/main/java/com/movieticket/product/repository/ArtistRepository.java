package com.movieticket.product.repository;

import com.movieticket.product.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtistRepository extends JpaRepository<Artist, String> {

}
