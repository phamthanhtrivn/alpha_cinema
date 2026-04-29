package com.movieticket.product.entity;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.ReleaseStatus;
import com.movieticket.product.enums.TranslationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "movies")
@Data
@Getter
@Setter
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
    private String bannerUrl;

    @ElementCollection
    @CollectionTable(name = "movie_projections", joinColumns = @JoinColumn(name = "movie_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "projection_type")
    private Set<ProjectionType> supportedProjection;

    @ElementCollection
    @CollectionTable(name = "movie_translations", joinColumns = @JoinColumn(name = "movie_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "translation_type")
    private Set<TranslationType> supportedTranslation;

    @ManyToOne
    @JoinColumn(name = "age_type_id")
    private AgeType ageType;

    private int releaseYear;
    private String nationality;

    @Enumerated(EnumType.STRING)
    private ReleaseStatus releaseStatus = ReleaseStatus.UPCOMING;

    @ElementCollection
    @CollectionTable(name = "movie_genres", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "genre")
    @BatchSize(size = 20) // gom 20 movie lại để truy vấn thể loại của nó cùng 1 lượt
    private Set<String> genre;

    @ManyToMany
    @JoinTable(name = "movie_actors", joinColumns = @JoinColumn(name = "movie_id"), inverseJoinColumns = @JoinColumn(name = "artist_id"))
    private Set<Artist> actors;

    @ManyToMany
    @JoinTable(name = "movie_directors", joinColumns = @JoinColumn(name = "movie_id"), inverseJoinColumns = @JoinColumn(name = "artist_id"))
    private Set<Artist> directors;

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
