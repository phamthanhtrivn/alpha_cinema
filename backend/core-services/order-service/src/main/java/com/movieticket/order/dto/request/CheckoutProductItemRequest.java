package com.movieticket.order.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutProductItemRequest {
    @NotBlank
    private String productId;

    @Min(1)
    private int quantity;

    @Min(0)
    private double unitPrice;
}
