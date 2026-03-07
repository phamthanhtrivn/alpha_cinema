package com.movieticket.cinema.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private String rowName;
    private String columnName;

    @ManyToOne
    @JoinColumn(name = "seat_type_id")
    private SeatType seatType;

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
