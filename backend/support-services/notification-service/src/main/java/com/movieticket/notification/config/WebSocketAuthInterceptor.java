package com.movieticket.notification.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String userId = accessor.getFirstNativeHeader("userId");
            if (userId != null && !userId.trim().isEmpty()) {
                log.info("WebSocket client connected. Registering Principal for user ID: {}", userId);
                accessor.setUser(new WebSocketPrincipal(userId));
            } else {
                log.warn("WebSocket client connected without a userId header.");
            }
        }
        return message;
    }
}
