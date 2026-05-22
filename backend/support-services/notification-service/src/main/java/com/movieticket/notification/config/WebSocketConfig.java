package com.movieticket.notification.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(frontendUrl);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Định tuyến cho các tin nhắn từ Server gửi xuống Client
        // Khách hàng sẽ "subcribe" (đăng ký) vào các đường dẫn bắt đầu bằng /user hoặc /topic
        registry.enableSimpleBroker("/topic", "/queue" ,"/user");

        // Tiền tố cho các tin nhắn từ Client gửi ngược lên Server (nếu có)
        registry.setApplicationDestinationPrefixes("/app");

        // Cấu hình tiền tố chuyên biệt cho việc gửi tin nhắn tới đích danh 1 User
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }
}
