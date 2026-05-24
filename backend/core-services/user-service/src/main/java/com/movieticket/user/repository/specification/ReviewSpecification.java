package com.movieticket.user.repository.specification;

import com.movieticket.user.entity.Review;
import com.movieticket.user.enums.ReviewStatus;
import com.movieticket.user.enums.ReviewType;
import org.springframework.data.jpa.domain.Specification;

public class ReviewSpecification {

    public static Specification<Review> hasStatus(ReviewStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Review> hasMovieId(String movieId) {
        return (root, query, cb) -> (movieId == null || movieId.isEmpty()) ? cb.conjunction() : cb.equal(root.get("movieId"), movieId);
    }

    public static Specification<Review> hasReviewType(ReviewType reviewType) {
        return (root, query, cb) -> reviewType == null ? cb.conjunction() : cb.equal(root.get("reviewType"), reviewType);
    }
}
