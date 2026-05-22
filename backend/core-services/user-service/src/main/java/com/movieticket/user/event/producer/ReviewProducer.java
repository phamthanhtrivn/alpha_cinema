package com.movieticket.user.event.producer;

import com.movieticket.user.event.model.ReviewModerationEvent;
import com.movieticket.user.event.model.MovieRatingUpdateEvent;
import com.movieticket.user.event.model.ReviewStatusNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "review-moderation-topic";

    public void sendReviewModerationEvent(ReviewModerationEvent event) {
        try {
            log.info("Đang gửi ReviewModerationEvent sang Kafka cho review id: {}", event.getReviewId());

            kafkaTemplate.send(TOPIC, event);

            log.info("Đã gửi thành công lên topic: {}", TOPIC);
        } catch (Exception e) {
            log.error("Lỗi khi gửi ReviewModerationEvent sang Kafka: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi sự kiện cho dịch vụ AI");
        }
    }

    public void sendMovieRatingUpdateEvent(MovieRatingUpdateEvent event) {
        try {
            log.info("Đang gửi MovieRatingUpdateEvent sang Kafka cho movie id: {}", event.getMovieId());
            kafkaTemplate.send("movie-events", event);
            log.info("Đã gửi thành công lên topic: movie-events");
        } catch (Exception e) {
            log.error("Lỗi khi gửi MovieRatingUpdateEvent sang Kafka: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi sự kiện cập nhật rating");
        }
    }
    public void sendReviewStatusNotificationEvent(ReviewStatusNotificationEvent event) {
        try {
            log.info("Đang gửi ReviewStatusNotificationEvent sang Kafka cho review id: {}", event.getReviewId());
            kafkaTemplate.send("notification-events", event);
            log.info("Đã gửi thành công lên topic: notification-events");
        } catch (Exception e) {
            log.error("Lỗi khi gửi ReviewStatusNotificationEvent sang Kafka: {}", e.getMessage());
        }
    }
}
