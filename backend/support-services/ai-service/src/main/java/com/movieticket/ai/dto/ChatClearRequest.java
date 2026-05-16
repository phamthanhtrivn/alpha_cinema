package com.movieticket.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatClearRequest {
    @NotBlank(message = "Conversation id is required")
    private String conversationId;

    private String customerId;

    private String customerName;
}
