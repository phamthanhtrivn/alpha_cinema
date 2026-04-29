package com.movieticket.product.specification;

import com.movieticket.product.entity.ShowSchedule;
import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


public class ShowScheduleSpecification {

    // 1. Lọc theo Movie ID
    public static Specification<ShowSchedule> hasMovieId(String movieId) {
        return (root, query, cb) ->
                movieId == null ? null : cb.equal(root.get("movie").get("id"), movieId);
    }

    // 2. Lọc theo Cinema ID
    public static Specification<ShowSchedule> hasCinemaId(String cinemaId) {
        return (root, query, cb) ->
                cinemaId == null ? null : cb.equal(root.get("cinemaId"), cinemaId);
    }

    // 3. Lọc theo Room ID
    public static Specification<ShowSchedule> hasRoomId(String roomId) {
        return (root, query, cb) ->
                roomId == null ? null : cb.equal(root.get("roomId"), roomId);
    }

    // 4. Lọc theo loại hình chiếu (2D, 3D, IMAX)
    public static Specification<ShowSchedule> hasProjectionType(ProjectionType type) {
        return (root, query, cb) ->
                type == null ? null : cb.equal(root.get("projectionType"), type);
    }

    // 5. Lọc theo loại dịch thuật (Sub, Voice)
    public static Specification<ShowSchedule> hasTranslationType(TranslationType type) {
        return (root, query, cb) ->
                type == null ? null : cb.equal(root.get("translationType"), type);
    }

    // 6. Lọc theo trạng thái (Active/Inactive)
    public static Specification<ShowSchedule> hasStatus(Boolean status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    // 7. Lọc theo ngày cụ thể (Từ 00:00:00 đến 23:59:59)
    public static Specification<ShowSchedule> onDate(LocalDate date) {
        return (root, query, cb) -> {
            if (date == null) return null;
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
            return cb.between(root.get("startTime"), startOfDay, endOfDay);
        };
    }

    // 8. CHỈ LẤY CÁC SUẤT TRONG TƯƠNG LAI (Dành cho trang khách hàng)
    public static Specification<ShowSchedule> isFutureShow() {
        return (root, query, cb) ->
                cb.greaterThan(root.get("startTime"), LocalDateTime.now());
    }
}
