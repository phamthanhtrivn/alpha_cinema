package com.movieticket.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "age_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgeType {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String name;
  private String description;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

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
