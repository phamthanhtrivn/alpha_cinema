package com.movieticket.ai.event.model;

import com.movieticket.ai.enums.ModerationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewModerationResultEvent {
    private String reviewId;
    private ModerationStatus status; // Sử dụng Enum thay vì String
    private String reason;
}
