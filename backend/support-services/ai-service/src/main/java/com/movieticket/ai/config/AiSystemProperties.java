package com.movieticket.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai.system")
public record AiSystemProperties(
        String productServiceBaseUrl,
        String cinemaServiceBaseUrl,
        String orderServiceBaseUrl,
        String reviewServiceBaseUrl,
        int requestTimeoutSeconds
) {
}
