package com.movieticket.ai.controller;

import com.movieticket.ai.common.ApiResponse;
import com.movieticket.ai.dto.ChatClearRequest;
import com.movieticket.ai.dto.ChatClearResponse;
import com.movieticket.ai.dto.ChatRequest;
import com.movieticket.ai.dto.ChatResponse;
import com.movieticket.ai.dto.PopularQuestionResponse;
import com.movieticket.ai.model.ChatRole;
import com.movieticket.ai.repository.ChatMessageRepository;
import com.movieticket.ai.service.ChatMemoryService;
import com.movieticket.ai.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final ChatMemoryService chatMemoryService;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.answerCustomerQuestion(request);
        return ApiResponse.success(response, "Answered chat question successfully");
    }

    @PostMapping("/chat/clear")
    public ApiResponse<ChatClearResponse> clearChat(@Valid @RequestBody ChatClearRequest request) {
        ChatClearResponse response = chatMemoryService.archiveAndClear(
                request.getConversationId(),
                request.getCustomerId(),
                request.getCustomerName()
        );
        return ApiResponse.success(response, "Archived and cleared chat conversation successfully");
    }

    @GetMapping("/analytics/popular-questions")
    public ApiResponse<List<PopularQuestionResponse>> popularQuestions(
            @RequestParam(defaultValue = "10") int limit
    ) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        List<PopularQuestionResponse> response = chatMessageRepository.findPopularQuestions(
                ChatRole.USER,
                PageRequest.of(0, safeLimit)
        );
        return ApiResponse.success(response, "Fetched popular AI questions successfully");
    }
}
