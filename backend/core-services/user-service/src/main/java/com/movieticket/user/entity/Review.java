package com.movieticket.user.entity;

import com.movieticket.user.enums.ReviewStatus;
import com.movieticket.user.enums.ReviewType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private int rating;
    private String comment;

    @ElementCollection
    @CollectionTable(name = "review_pictures", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "picture_url")   
    private List<String> pictures;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private ReviewStatus status;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private String movieId;

    @Enumerated(EnumType.STRING)
    private ReviewType reviewType;

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
