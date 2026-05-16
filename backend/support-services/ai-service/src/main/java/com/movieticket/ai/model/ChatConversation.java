package com.movieticket.ai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_chat_conversations")
@Getter
@Setter
@NoArgsConstructor
public class ChatConversation {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "customer_id", length = 100)
    private String customerId;

    @Column(name = "customer_name", length = 255)
    private String customerName;

    @Column(name = "message_count", nullable = false)
    private Integer messageCount = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "archived_at")
    private Instant archivedAt;

    public ChatConversation(String id, String customerId, String customerName, Integer messageCount) {
        this.id = id != null && !id.isBlank() ? id : UUID.randomUUID().toString();
        this.customerId = customerId;
        this.customerName = customerName;
        this.messageCount = messageCount;
        this.archivedAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = now;
        updatedAt = now;
        if (archivedAt == null) {
            archivedAt = now;
        }
        if (messageCount == null) {
            messageCount = 0;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
