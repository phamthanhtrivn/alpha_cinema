package com.movieticket.ai.repository;

import com.movieticket.ai.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {
}
