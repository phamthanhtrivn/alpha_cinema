package com.movieticket.user.event.consumer;

import com.movieticket.user.event.model.ReviewModerationResultEvent;
import com.movieticket.user.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewModerationResultConsumer {
    private final ReviewService reviewService;

    @KafkaListener(topics = "review-moderation-result-topic", groupId = "user-service-group")
    public void consumeModerationResult(ReviewModerationResultEvent event) {
        try {
            log.info("Nhận kết quả duyệt cho review {}: {} - Lý do: {}", 
                     event.getReviewId(), event.getStatus(), event.getReason());
            reviewService.updateReviewStatus(event.getReviewId(), event.getStatus(), event.getReason());
        } catch (Exception e) {
            log.error("Lỗi khi xử lý kết quả duyệt đánh giá: {}", e.getMessage());
        }
    }
}
