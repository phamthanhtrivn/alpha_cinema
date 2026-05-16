package com.movieticket.ai.dto.tool;

import java.math.BigDecimal;

public record CustomerMembershipToolResponse(
        String customerId,
        String customerName,
        Integer point,
        String membershipLevel,
        BigDecimal discountRate
) {
}
