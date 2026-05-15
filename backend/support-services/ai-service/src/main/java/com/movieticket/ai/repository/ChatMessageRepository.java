package com.movieticket.ai.repository;

import com.movieticket.ai.dto.PopularQuestionResponse;
import com.movieticket.ai.model.ChatMessage;
import com.movieticket.ai.model.ChatRole;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    long countByConversationId(String conversationId);

    @Query("""
            select new com.movieticket.ai.dto.PopularQuestionResponse(m.content, count(m))
            from ChatMessage m
            where m.role = :role
            group by m.content
            order by count(m) desc
            """)
    List<PopularQuestionResponse> findPopularQuestions(ChatRole role, Pageable pageable);
}
