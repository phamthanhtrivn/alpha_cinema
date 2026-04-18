package com.movieticket.cinema.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "cinema_id")
    private Cinema cinema;

    private int roomNumber;

    @Enumerated(EnumType.STRING)
    private ProjectionType projectionType;

    private int capacity;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean status;

    public Room(String id ,Cinema cinema, int roomNumber, int capacity,ProjectionType projectionType, boolean status) {
        this.capacity = capacity;
        this.id = id;
        this.cinema = cinema;
        this.projectionType = projectionType;
        this.roomNumber = roomNumber;
        this.status = status;
    }



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
