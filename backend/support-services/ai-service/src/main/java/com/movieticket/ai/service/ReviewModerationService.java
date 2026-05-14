package com.movieticket.ai.service;

import com.movieticket.ai.common.ImageFetchUtil;
import com.movieticket.ai.enums.ModerationStatus;
import com.movieticket.ai.event.model.ReviewModerationEvent;
import com.movieticket.ai.event.model.ReviewModerationResultEvent;
import com.movieticket.ai.event.producer.ReviewModerationResultProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.content.Media;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import com.movieticket.ai.common.ImageFetchUtil;
import org.springframework.core.io.Resource;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReviewModerationService {

    private final ChatClient chatClient;
    private final ReviewModerationResultProducer resultProducer;
    private final ImageFetchUtil imageFetchUtil;

    public void processReviewModeration(ReviewModerationEvent event) {
        log.info("Bắt đầu duyệt đánh giá ID: {}", event.getReviewId());

        String promptText = """
                Bạn là một chuyên gia duyệt nội dung cho rạp chiếu phim Alpha Cinema.
                Nhiệm vụ của bạn là kiểm tra đánh giá phim sau đây (bao gồm văn bản và hình ảnh nếu có).
                Hãy phân tích và trả về kết quả JSON đúng chuẩn.
                Các tiêu chí từ chối (trả về trạng thái HIDDEN):
                1. Chứa ngôn ngữ thô tục, xúc phạm, toxic.
                2. Spoil nội dung phim quá mức.
                3. Hình ảnh nhạy cảm, không liên quan đến phim ảnh hoặc rạp phim.
                4. Quảng cáo rác.
                Nếu nội dung tốt, hãy trả về APPROVED.
                Nội dung đánh giá cần duyệt:
                """ + event.getComment();

        List<Media> mediaList = new ArrayList<>();
        if (event.getPictures() != null && !event.getPictures().isEmpty()) {
            for (String url : event.getPictures()) {
                Resource imageResource = imageFetchUtil.fetchImageAsResource(url);
                if (imageResource != null) {
                    mediaList.add(new Media(MimeTypeUtils.IMAGE_JPEG, imageResource));
                }
            }
        }

        try {
            UserMessage.Builder userMessageBuilder = UserMessage.builder()
                    .text(promptText);
            
            for (Media media : mediaList) {
                userMessageBuilder.media(media);
            }

            UserMessage userMessage = userMessageBuilder.build();

            ModerationResult result = chatClient.prompt()
                    .messages(userMessage)
                    .call()
                    .entity(ModerationResult.class);

            log.info("Kết quả duyệt cho Review {}: {}", event.getReviewId(), result);

            // Gửi kết quả về user-service
            ReviewModerationResultEvent resultEvent = new ReviewModerationResultEvent(
                    event.getReviewId(),
                    result.status(),
                    result.reason()
            );
            resultProducer.sendModerationResult(resultEvent);

        } catch (Exception e) {
            log.error("Lỗi khi dùng Spring AI để duyệt đánh giá: {}", e.getMessage());
            // Fallback: nếu lỗi có thể gửi PENDING hoặc HIDDEN tùy chính sách
        }
    }

    public record ModerationResult(ModerationStatus status, String reason) {}
}
