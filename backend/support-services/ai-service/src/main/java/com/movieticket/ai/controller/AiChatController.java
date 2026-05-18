package com.movieticket.ai.controller;
import com.movieticket.ai.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

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
