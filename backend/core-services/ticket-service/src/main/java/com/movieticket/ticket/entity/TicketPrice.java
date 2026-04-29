package com.movieticket.ticket.entity;

import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.ProjectionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "ticket_prices",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"seatTypeId", "projectionType", "dayType"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketPrice {
    @Id
    private String id;
    
    private String seatTypeId;
    
    @Enumerated(EnumType.STRING)
    private ProjectionType projectionType;
    
    @Enumerated(EnumType.STRING)
    private DayType dayType;
    
    private double price;

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
