package com.movieticket.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProductDTO {
    @NotBlank(message = "Product ID is required")
    private String productId;
    @NotBlank(message = "Product quantity is required")
    @Min(value = 1, message = "Product quantity must be greater than 0")
    private Integer quantity;
    @NotBlank(message = "Product price is required")
    @Min(value = 1, message = "Product price must be greater than 0")
    private Double price;
}
