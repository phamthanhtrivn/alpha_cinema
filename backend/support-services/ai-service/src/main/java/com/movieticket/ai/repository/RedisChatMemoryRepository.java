package com.movieticket.ai.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Repository
@RequiredArgsConstructor
@Slf4j
public class RedisChatMemoryRepository implements ChatMemoryRepository {
    private static final String KEY_PREFIX = "ai:chat-memory:";
    private static final TypeReference<List<StoredMessage>> STORED_MESSAGES_TYPE = new TypeReference<>() {
    };

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public List<String> findConversationIds() {
        try {
            Set<String> keys = redisTemplate.keys(KEY_PREFIX + "*");
            if (keys == null || keys.isEmpty()) {
                return List.of();
            }

            return keys.stream()
                    .map(key -> key.substring(KEY_PREFIX.length()))
                    .toList();
        } catch (Exception ex) {
            log.warn("Failed to list chat memory conversations from Redis: {}", ex.getMessage());
            return List.of();
        }
    }

    @Override
    public List<Message> findByConversationId(String conversationId) {
        if (conversationId == null || conversationId.isBlank()) {
            return List.of();
        }

        try {
            String rawMessages = redisTemplate.opsForValue().get(toKey(conversationId));
            if (rawMessages == null || rawMessages.isBlank()) {
                return List.of();
            }

            return objectMapper.readValue(rawMessages, STORED_MESSAGES_TYPE).stream()
                    .map(this::toMessage)
                    .filter(Objects::nonNull)
                    .toList();
        } catch (Exception ex) {
            log.warn("Failed to read chat memory from Redis. conversationId={}, error={}", conversationId, ex.getMessage());
            return List.of();
        }
    }

    @Override
    public void saveAll(String conversationId, List<Message> messages) {
        if (conversationId == null || conversationId.isBlank()) {
            return;
        }

        List<StoredMessage> storedMessages = messages == null ? List.of() : messages.stream()
                .filter(Objects::nonNull)
                .map(this::toStoredMessage)
                .filter(Objects::nonNull)
                .toList();

        try {
            redisTemplate.opsForValue().set(toKey(conversationId), objectMapper.writeValueAsString(storedMessages));
        } catch (Exception ex) {
            log.warn("Failed to save chat memory to Redis. conversationId={}, error={}", conversationId, ex.getMessage());
        }
    }

    @Override
    public void deleteByConversationId(String conversationId) {
        if (conversationId != null && !conversationId.isBlank()) {
            try {
                redisTemplate.delete(toKey(conversationId));
            } catch (Exception ex) {
                log.warn("Failed to delete chat memory from Redis. conversationId={}, error={}", conversationId, ex.getMessage());
            }
        }
    }

    private StoredMessage toStoredMessage(Message message) {
        if (message.getMessageType() == null || message.getText() == null) {
            return null;
        }

        return new StoredMessage(message.getMessageType().name(), message.getText());
    }

    private Message toMessage(StoredMessage storedMessage) {
        if (storedMessage == null || storedMessage.text() == null || storedMessage.role() == null) {
            return null;
        }

        MessageType messageType;
        try {
            messageType = MessageType.valueOf(storedMessage.role());
        } catch (IllegalArgumentException ex) {
            return null;
        }

        if (MessageType.USER.equals(messageType)) {
            return new UserMessage(storedMessage.text());
        }

        if (MessageType.ASSISTANT.equals(messageType)) {
            return new AssistantMessage(storedMessage.text());
        }

        if (MessageType.SYSTEM.equals(messageType)) {
            return new SystemMessage(storedMessage.text());
        }

        return null;
    }

    private String toKey(String conversationId) {
        return KEY_PREFIX + conversationId;
    }

    private record StoredMessage(String role, String text) {
    }
}
