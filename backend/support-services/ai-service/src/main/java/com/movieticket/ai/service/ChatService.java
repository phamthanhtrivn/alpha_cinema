package com.movieticket.ai.service;

import com.movieticket.ai.dto.ChatMessageResponse;
import com.movieticket.ai.dto.ChatRequest;
import com.movieticket.ai.dto.ChatResponse;
import com.movieticket.ai.dto.CitationResponse;
import com.movieticket.ai.dto.KnowledgeResponse;
import com.movieticket.ai.model.ChatConversation;
import com.movieticket.ai.model.ChatMessage;
import com.movieticket.ai.model.ChatRole;
import com.movieticket.ai.repository.ChatConversationRepository;
import com.movieticket.ai.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.content.Media;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import com.movieticket.ai.common.ImageFetchUtil;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.core.io.Resource;
import org.springframework.util.MimeTypeUtils;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClient chatClient;
    private final ImageFetchUtil imageFetchUtil;

    public Flux<String> streamChat(String message) {
        return chatClient.prompt()
                .user(message)
                .stream()
                .content();
    }

    /**
     * Hàm test để AI mô tả hình ảnh từ một URL
     */
    public String describeImage(String message, String imageUrl) {
        Resource imageResource = imageFetchUtil.fetchImageAsResource(imageUrl);
        if (imageResource == null) {
            return "Không thể tải hình ảnh từ URL cung cấp.";
        }

        UserMessage userMessage = UserMessage.builder()
                .text(message)
                .media(new Media(MimeTypeUtils.IMAGE_JPEG, imageResource))
                .build();

        return chatClient.prompt()
                .messages(userMessage)
                .call()
                .content();
    }
}
