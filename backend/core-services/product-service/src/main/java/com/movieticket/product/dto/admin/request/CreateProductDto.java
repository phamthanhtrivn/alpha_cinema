package com.movieticket.product.dto.request;

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

    @NotNull(message = "Giá sản phẩm là bắt buộc")
    @Min(value = 20000, message = "Giá sản phẩm phải ít nhất 20,000")
    @Max(value = 500000, message = "Giá sản phẩm không được vượt quá 500,000")
    private Double unitPrice;

    private String description;
    
    @NotNull(message = "Loại sản phẩm là bắt buộc")
    private ProductType type;
}
