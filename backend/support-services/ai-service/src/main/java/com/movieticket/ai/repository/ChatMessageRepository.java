package com.movieticket.ai.repository;

import com.movieticket.ai.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop10ByConversationIdOrderByCreatedAtDesc(String conversationId);

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}
