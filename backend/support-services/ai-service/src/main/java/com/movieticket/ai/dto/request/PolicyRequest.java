package com.movieticket.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PolicyRequest {
    @NotBlank(message = "Policy title is required")
    private String title;

    @NotBlank(message = "Policy topic is required")
    private String topic;

    @NotBlank(message = "Policy content is required")
    private String content;

    private Boolean active = true;
}
