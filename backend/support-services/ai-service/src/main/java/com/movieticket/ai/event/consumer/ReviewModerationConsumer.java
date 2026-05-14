package com.movieticket.ai.event.consumer;

import com.movieticket.ai.event.model.ReviewModerationEvent;
import com.movieticket.ai.service.ReviewModerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewModerationConsumer {
    private final ReviewModerationService moderationService;

    @KafkaListener(topics = "review-moderation-topic", groupId = "ai-service-group")
    public void consumeReviewModeration(ReviewModerationEvent event) {
        try {
            log.info("Nhận được yêu cầu duyệt đánh giá từ Kafka: {}", event.getReviewId());
            moderationService.processReviewModeration(event);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý message từ Kafka: {}", e.getMessage());
        }
    }
}
