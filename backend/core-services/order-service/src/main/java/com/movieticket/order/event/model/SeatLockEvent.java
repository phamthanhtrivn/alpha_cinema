package com.movieticket.order.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatLockEvent {
    private String eventId;
    private String showScheduleId;
    private List<String> seatIds;
    private String status;
    private String sessionId;
    private String source;
    private LocalDateTime expiresAt;
    private LocalDateTime occurredAt;
}
