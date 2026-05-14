package com.movieticket.ai.event.producer;

import com.movieticket.ai.event.model.ReviewModerationResultEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewModerationResultProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "review-moderation-result-topic";

    public void sendModerationResult(ReviewModerationResultEvent event) {
        try {
            log.info("Đang gửi kết quả duyệt đánh giá (ID: {}) sang user-service", event.getReviewId());
            kafkaTemplate.send(TOPIC, event);
            log.info("Gửi thành công kết quả: {}", event.getStatus());
        } catch (Exception e) {
            log.error("Lỗi khi gửi kết quả duyệt lên Kafka: {}", e.getMessage());
        }
    }
}
