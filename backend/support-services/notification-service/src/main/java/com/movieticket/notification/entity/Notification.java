package com.movieticket.notification.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class Notification {
    @Id
    private String id;
    private String customerId;
    private String title;
    private String content;
    private String type;
    private String url;
    private boolean isRead;
    private LocalDateTime createdAt;
}
