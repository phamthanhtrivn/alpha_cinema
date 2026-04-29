package com.movieticket.product.specification;

import com.movieticket.product.dto.request.ShowScheduleSearchDTO;
import com.movieticket.product.entity.ShowSchedule;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class ShowScheduleSpecification {
    public static Specification<ShowSchedule> filter(ShowScheduleSearchDTO dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dto.getMovieId() != null) {
                predicates.add(cb.equal(root.get("movie").get("id"), dto.getMovieId()));
            }
            if (dto.getCinemaId() != null) {
                predicates.add(cb.equal(root.get("cinemaId"), dto.getCinemaId()));
            }
            if (dto.getRoomId() != null) {
                predicates.add(cb.equal(root.get("roomId"), dto.getRoomId()));
            }
            if (dto.getProjectionType() != null) {
                predicates.add(cb.equal(root.get("projectionType"), dto.getProjectionType()));
            }
            if (dto.getTranslationType() != null) {
                predicates.add(cb.equal(root.get("translationType"), dto.getTranslationType()));
            }
            if (dto.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), dto.getStatus()));
            }

            // Xử lý tìm kiếm theo ngày (Bắt đầu từ 0h đến cuối ngày)
            if (dto.getDate() != null) {
                LocalDateTime startOfDay = dto.getDate().atStartOfDay();
                LocalDateTime endOfDay = dto.getDate().atTime(LocalTime.MAX);
                predicates.add(cb.between(root.get("startTime"), startOfDay, endOfDay));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
