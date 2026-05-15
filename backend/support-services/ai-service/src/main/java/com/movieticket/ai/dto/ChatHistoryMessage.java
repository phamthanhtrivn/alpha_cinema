package com.movieticket.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatHistoryMessage {
    @NotBlank(message = "Message role is required")
    private String role;

    @NotBlank(message = "Message content is required")
    @Size(max = 2000, message = "Message content is too long")
    private String content;
}
