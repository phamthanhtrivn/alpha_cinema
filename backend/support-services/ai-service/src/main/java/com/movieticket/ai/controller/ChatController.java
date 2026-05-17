package com.movieticket.ai.controller;

import com.movieticket.ai.common.ApiResponse;
import com.movieticket.ai.dto.request.ChatClearRequest;
import com.movieticket.ai.dto.response.ChatClearResponse;
import com.movieticket.ai.dto.response.ChatHistoryMessage;
import com.movieticket.ai.dto.response.ChatRequest;
import com.movieticket.ai.dto.response.ChatResponse;
import com.movieticket.ai.dto.response.PopularQuestionResponse;
import com.movieticket.ai.service.ChatMemoryService;
import com.movieticket.ai.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/chat/history")
    public ApiResponse<List<ChatHistoryMessage>> chatHistory(
            @RequestParam String conversationId
    ) {
        List<ChatHistoryMessage> response = chatMemoryService.getConversationMessages(conversationId);
        return ApiResponse.success(response, "Fetched chat history successfully");
    }

    @GetMapping("/chat/starter-questions")
    public ApiResponse<List<PopularQuestionResponse>> starterQuestions() {
        List<PopularQuestionResponse> response = chatService.getPopularQuestions();
        return ApiResponse.success(response, "Fetched starter questions successfully");
    }
}
