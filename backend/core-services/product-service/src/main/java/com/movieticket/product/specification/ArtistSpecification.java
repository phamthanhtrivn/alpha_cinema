package com.movieticket.product.specification;

import com.movieticket.product.entity.Artist;
import com.movieticket.product.enums.ArtistType;
import org.springframework.data.jpa.domain.Specification;

public class ArtistSpecification {
    public static Specification<Artist> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.isEmpty()) return null;
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), "%" + name.toLowerCase() + "%");
        };
    }

    public static Specification<Artist> hasType(ArtistType type) {
        return (root, query, criteriaBuilder) -> {
            if (type == null) return null;
            return criteriaBuilder.equal(root.get("type"), type);
        };
    }

    public static Specification<Artist> hasCountry(String country) {
        return (root, query, criteriaBuilder) -> {
            if (country == null || country.isEmpty()) return null;
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("nationality")), "%" + country.toLowerCase() + "%");
        };
    }
}
