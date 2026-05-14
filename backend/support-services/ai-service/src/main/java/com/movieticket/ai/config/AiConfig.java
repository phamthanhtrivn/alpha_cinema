package com.movieticket.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    /**
     * Định nghĩa Bean ChatClient để có thể sử dụng @RequiredArgsConstructor 
     * và inject trực tiếp ChatClient vào các Service.
     */
    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }
}
