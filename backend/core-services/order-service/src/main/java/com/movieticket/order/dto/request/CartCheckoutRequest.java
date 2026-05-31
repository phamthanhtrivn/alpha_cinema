package com.movieticket.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CartCheckoutRequest {
    @NotBlank(message = "Cinema ID is required")
    private String cinemaId;

    @NotEmpty(message = "Products list cannot be empty")
    private List<CheckoutProductItemRequest> products;

    private String promotionCode;

    private Integer pointsToRedeem;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // e.g. "MOMO" or "VNPAY"

    private String bankCode;
}
