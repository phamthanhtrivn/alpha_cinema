package com.movieticket.notification.repositories;

import com.movieticket.notification.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Lấy thông báo mới nhất của khách hàng lên đầu
    Page<Notification> findByCustomerIdOrderByCreatedAtDesc(String customerId, Pageable pageable);

    // Đếm xem khách còn bao nhiêu tin chưa đọc để hiện số trên cái chuông
    long countByCustomerIdAndIsReadFalse(String customerId);
}