package com.movieticket.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String code;
    private int discount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int quantity;
    private int remainingQuantity;
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
