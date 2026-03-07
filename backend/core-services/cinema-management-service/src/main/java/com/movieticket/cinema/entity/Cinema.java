package com.movieticket.cinema.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cinemas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cinema {
    @Id
    private String id;
    private String name;
    private String address;
    private String phone;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean status;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
