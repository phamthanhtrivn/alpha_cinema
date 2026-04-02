package com.movieticket.product.dto;

import com.movieticket.product.enums.ProductType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateProductDto {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Min(value = 20000, message = "Giá sản phẩm phải lớn hơn hoặc bằng 20,000")
    @Max(value = 500000, message = "Giá sản phẩm phải nhỏ hơn hoặc bằng 500,000")
    private double unitPrice;

    private String description;
    @NotNull(message = "Product type is required")
    private ProductType type;
}
