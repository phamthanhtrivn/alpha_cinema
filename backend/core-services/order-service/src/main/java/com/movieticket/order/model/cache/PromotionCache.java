package com.movieticket.order.model.cache;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionCache {
    private String id;
    private String code;
    private int discount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int remainingQuantity;
    private boolean status;
}
