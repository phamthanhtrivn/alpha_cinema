package com.movieticket.notification.repositories;

import com.movieticket.notification.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Lấy thông báo mới nhất của khách hàng lên đầu
    List<Notification> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    // Đếm xem khách còn bao nhiêu tin chưa đọc để hiện số trên cái chuông
    long countByCustomerIdAndIsReadFalse(String customerId);
}