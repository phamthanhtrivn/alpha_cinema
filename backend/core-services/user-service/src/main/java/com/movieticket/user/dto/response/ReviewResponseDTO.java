package com.movieticket.user.dto.response;

import com.movieticket.user.enums.ReviewType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder

public class ReviewResponseDTO {
    private String id;
    private int rating;
    private String customerId;
    private String customerName;
    private String comment;
    private ReviewType reviewType;
    private List<String> pictures;
    private LocalDateTime createdAt;
    private String status; // Sẽ là "PENDING"
    private String movieId;
}