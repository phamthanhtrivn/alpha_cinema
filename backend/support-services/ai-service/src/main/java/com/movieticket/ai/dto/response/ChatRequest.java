package com.movieticket.ai.dto.response;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "Question is required")
    private String question;

    private String conversationId;

    private String customerId;

    private String customerName;

}
