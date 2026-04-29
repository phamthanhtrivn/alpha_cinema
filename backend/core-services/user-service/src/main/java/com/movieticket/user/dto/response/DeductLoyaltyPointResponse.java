package com.movieticket.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeductLoyaltyPointResponse {
    private boolean success;
    private String message;
    private int remainingPoints;
}
