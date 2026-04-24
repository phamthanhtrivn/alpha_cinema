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

    @NotNull(message = "Giá sản phẩm là bắt buộc")
    @Min(value = 20000, message = "Giá sản phẩm phải ít nhất 20,000")
    @Max(value = 500000, message = "Giá sản phẩm không được vượt quá 500,000")
    private Double unitPrice;

    private String description;
    @NotNull(message = "Product type is required")
    private ProductType type;
    
    private boolean status;
}
