package com.movieticket.product.repository;

import com.movieticket.product.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.Set;

public interface ArtistRepository extends JpaRepository<Artist, String>, JpaSpecificationExecutor<Artist> {
}
