package com.movieticket.notification.service;

import com.movieticket.notification.entity.Notification;
import com.movieticket.notification.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public Page<Notification> getNotificationsByCustomerId(String customerId, Pageable pageable) {
        return notificationRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
    }

    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public Notification createNotification(String customerId, String title, String content, String type, String url) {
        Notification notification = Notification.builder()
                .customerId(customerId)
                .title(title)
                .content(content)
                .type(type)
                .url(url)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }
}
