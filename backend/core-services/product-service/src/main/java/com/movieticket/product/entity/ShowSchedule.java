package com.movieticket.product.entity;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "show_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowSchedule {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne
  @JoinColumn(name = "movie_id")
  private Movie movie;

  @Enumerated(EnumType.STRING)
  private ProjectionType projectionType;

  @Enumerated(EnumType.STRING)
  private TranslationType translationType;

  private String roomId;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private int availableSeat;
  private boolean status = true;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  private String cinemaId;

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
