package com.movieticket.order.model.cache;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerLoyaltyCache {
    private String customerId;
    private int loyaltyPoint;
    private boolean status;
}
