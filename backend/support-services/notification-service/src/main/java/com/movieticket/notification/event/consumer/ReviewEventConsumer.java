package com.movieticket.notification.event.consumer;

import com.movieticket.notification.event.model.ReviewStatusNotificationEvent;
import com.movieticket.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewEventConsumer {
    private final NotificationService notificationService;
    private static final String TOPIC = "review-events";
    @KafkaListener(topics = TOPIC, groupId = "notification-service-group")
    public void consumeReviewStatus(ReviewStatusNotificationEvent event) {
        log.info("Nhận sự kiện thông báo trạng thái review cho customer: {}, status: {}", event.getCustomerId(), event.getStatus());
        
        String title = "Kết quả duyệt đánh giá phim";
        String content;
        if ("APPROVED".equals(event.getStatus())) {
            content = "Đánh giá của bạn đã được duyệt thành công.";
        } else {
            content = "Đánh giá của bạn bị từ chối do: " + (event.getReason() != null ? event.getReason() : "Vi phạm tiêu chuẩn cộng đồng.");
        }
        
        notificationService.createNotification(
            event.getCustomerId(), 
            title, 
            content, 
            "REVIEW_STATUS", 
            "/profile/reviews"
        );
    }
}
