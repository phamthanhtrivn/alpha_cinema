package com.movieticket.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CheckoutEmployeeRequest {
    @NotBlank(message = "Order ID is required")
    @Min(value = 1, message = "Order ID must be greater than 0")
    private Double totalPayment;
    private String showScheduleId;
    private List<SeatDTO> seats;
    private List<ProductDTO> products;
}
