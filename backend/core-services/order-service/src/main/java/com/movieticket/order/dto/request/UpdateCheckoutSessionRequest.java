package com.movieticket.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateCheckoutSessionRequest {
    @Valid
    private List<CheckoutProductItemRequest> items;

    private String promotionCode;

    @Min(0)
    private Double promotionDiscount;

    @Min(0)
    private Double pointDiscount;

    @Min(0)
    private Integer pointsToRedeem;
}
