package com.movieticket.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "combos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private double unitPrice;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "combo_pictures", joinColumns = @JoinColumn(name = "combo_id"))
    @Column(name = "picture_url")
    private List<String> pictures;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean status;

    @OneToMany(mappedBy = "combo", cascade = CascadeType.ALL)
    private List<ComboDetail> comboDetails;

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
