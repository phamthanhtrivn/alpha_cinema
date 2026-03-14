package com.movieticket.product.dto;

import com.movieticket.product.enums.ProductType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProductDto {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Price is required")
    @Min(value = 20000, message = "Price must be at least 20,000")
    @Max(value = 500000, message = "Price must be at most 500,000")
    private double unitPrice;

    private String description;
    @NotNull(message = "Product type is required")
    private ProductType type;
    private boolean status;
}
