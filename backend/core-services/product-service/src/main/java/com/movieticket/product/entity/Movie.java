package com.movieticket.product.entity;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.ReleaseStatus;
import com.movieticket.product.enums.TranslationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String title;
  private int duration;
  private LocalDate premiereDate;
  private String producer;

  @Column(columnDefinition = "TEXT")
  private String description;

  private String trailerUrl;
  private String thumbnailUrl;

  @ElementCollection
  @CollectionTable(name = "movie_projections", joinColumns = @JoinColumn(name = "movie_id"))
  @Enumerated(EnumType.STRING)
  @Column(name = "projection_type")
  private List<ProjectionType> supportedProjection;

  @ElementCollection
  @CollectionTable(name = "movie_translations", joinColumns = @JoinColumn(name = "movie_id"))
  @Enumerated(EnumType.STRING)
  @Column(name = "translation_type")
  private List<TranslationType> supportedTranslation;

  @ManyToOne
  @JoinColumn(name = "age_type_id")
  private AgeType ageType;

  private int releaseYear;
  private String nationality;

  @Enumerated(EnumType.STRING)
  private ReleaseStatus releaseStatus;

  @ElementCollection
  @CollectionTable(name = "movie_genres", joinColumns = @JoinColumn(name = "movie_id"))
  @Column(name = "genre")
  private List<String> genre;

  @ManyToMany
  @JoinTable(name = "movie_actors", joinColumns = @JoinColumn(name = "movie_id"), inverseJoinColumns = @JoinColumn(name = "artist_id"))
  private List<Artist> actors;

  @ManyToMany
  @JoinTable(name = "movie_directors", joinColumns = @JoinColumn(name = "movie_id"), inverseJoinColumns = @JoinColumn(name = "artist_id"))
  private List<Artist> directors;

  private double avgRating;
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
