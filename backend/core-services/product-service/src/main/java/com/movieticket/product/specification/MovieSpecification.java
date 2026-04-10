package com.movieticket.product.specification;

import com.movieticket.product.entity.AgeType;
import com.movieticket.product.entity.Artist;
import com.movieticket.product.entity.Movie;
import org.springframework.data.jpa.domain.Specification;

public class MovieSpecification {
    public static Specification<Movie> hasTitle(String title) {
        return (root, query, criteriaBuilder) -> {
            if (title == null || title.isEmpty()) return null;
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    public static Specification<Movie> hasReleaseStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.isEmpty()) return null;
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("releaseStatus")), "%" + status.toLowerCase() + "%");
        };
    }

    public static Specification<Movie> hasNationality(String nationality) {
        return (root, query, criteriaBuilder) -> {
            if (nationality == null || nationality.isEmpty()) return null;
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("nationality")), "%" + nationality.toLowerCase() + "%");
        };
    }

    public static Specification<Movie> hasReleaseYear(Integer year) {
        return (root, query, criteriaBuilder) -> {
            if (year == null) return null;

            return criteriaBuilder.greaterThanOrEqualTo(root.get("releaseYear"), year);
        };
    }

    public static Specification<Movie> hasAgeType(String ageTypeId) {
        return (root, query, criteriaBuilder) -> {
            if (ageTypeId == null || ageTypeId.isEmpty()) return null;
            return criteriaBuilder.equal(root.get("ageType").get("id"), ageTypeId);
        };
    }
}
