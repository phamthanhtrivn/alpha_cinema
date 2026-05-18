package com.movieticket.ai.controller;

import com.movieticket.ai.common.ApiResponse;
import com.movieticket.ai.dto.ChatMessageResponse;
import com.movieticket.ai.dto.ChatRequest;
import com.movieticket.ai.dto.ChatResponse;
import com.movieticket.ai.dto.KnowledgeIngestRequest;
import com.movieticket.ai.dto.KnowledgeBulkIngestResponse;
import com.movieticket.ai.dto.KnowledgeResponse;
import com.movieticket.ai.dto.McpJsonRpcRequest;
import com.movieticket.ai.dto.McpJsonRpcResponse;
import com.movieticket.ai.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {
    private final ChatService chatService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@RequestParam String message) {
        return chatService.streamChat(message);
    }

    @GetMapping("/describe")
    public String describeImage(
            @RequestParam(defaultValue = "Mô tả hình ảnh này giúp tôi") String message,
            @RequestParam String imageUrl) {
        return chatService.describeImage(message, imageUrl);
    }
}
