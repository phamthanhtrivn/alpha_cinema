package com.movieticket.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "artists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artist {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String fullName;

  @Column(columnDefinition = "TEXT")
  private String bio;

  private LocalDate dateOfBirth;
  private String nationality;
  private String avatarUrl;

  @Enumerated(EnumType.STRING)
  private ArtistType type;

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
