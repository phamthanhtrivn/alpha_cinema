package com.movieticket.ai.repository;

import com.movieticket.ai.dto.response.PopularQuestionResponse;
import com.movieticket.ai.model.ChatMessage;
import com.movieticket.ai.enums.ChatRole;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    long countByConversationId(String conversationId);

    @Query("""
            select new com.movieticket.ai.dto.response.PopularQuestionResponse(trim(m.content), count(m))
            from ChatMessage m
            where m.role = :role
            and trim(m.content) <> ''
            group by trim(m.content)
            order by count(m) desc
            """)
    List<PopularQuestionResponse> findPopularQuestions(ChatRole role, Pageable pageable);
}
