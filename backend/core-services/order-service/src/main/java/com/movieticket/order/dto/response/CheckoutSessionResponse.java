package com.movieticket.order.dto.response;

import com.movieticket.order.dto.request.SeatRequestDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CheckoutSessionResponse {
    private String sessionId;
    private String orderId;
    private String customerId;
    private String showScheduleId;
    private List<SeatRequestDto> seats;
    private List<CheckoutProductItemResponse> items;
    private String promotionCode;
    private double seatSubtotal;
    private double productSubtotal;
    private double promotionDiscount;
    private double pointDiscount;
    private int pointsRedeemed;
    private int availableLoyaltyPoints;
    private double totalPayment;
    private String status;
    private LocalDateTime expiresAt;
}
