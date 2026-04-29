package com.movieticket.order.dto.client;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeductLoyaltyPointRequest {
    private int pointsToDeduct;
}
