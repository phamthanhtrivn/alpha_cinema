package com.movieticket.order.model.cache;

import com.movieticket.order.dto.request.SeatRequestDto;
import com.movieticket.order.enums.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutSessionCache {
    private String sessionId;
    private String cinemaId;
    private String customerId;
    private String orderId;
    private String showScheduleId;
    @Builder.Default
    private List<SeatRequestDto> seats = new ArrayList<>();
    @Builder.Default
    private List<CheckoutProductItemCache> items = new ArrayList<>();
    private String promotionCode;
    private double seatSubtotal;
    private double productSubtotal;
    private double promotionDiscount;
    private double pointDiscount;
    private int pointsRedeemed;
    private int availableLoyaltyPoints;
    private double totalPayment;
    private LocalDateTime expiresAt;
    private SessionStatus status;
}
