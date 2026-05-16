package com.movieticket.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai.tool")
public record AiToolProperties(Long timeoutMs) {
    public long safeTimeoutMs() {
        return timeoutMs == null || timeoutMs <= 0 ? 3000L : timeoutMs;
    }
}
