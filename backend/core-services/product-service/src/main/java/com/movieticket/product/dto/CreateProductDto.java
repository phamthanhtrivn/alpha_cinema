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
<<<<<<< HEAD
    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Price is required")
    @Min(value = 20000, message = "Price must be at least 20,000")
    @Max(value = 500000, message = "Price must be at most 500,000")
    private double unitPrice;

    private String description;
    @NotNull(message = "Product type is required")
=======
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotNull(message = "Giá sản phẩm là bắt buộc")
    @Min(value = 20000, message = "Giá sản phẩm phải ít nhất 20,000")
    @Max(value = 500000, message = "Giá sản phẩm không được vượt quá 500,000")
    private double unitPrice;

    private String description;
    @NotNull(message = "Loại sản phẩm là bắt buộc")
>>>>>>> 8dcf4ad36f4973cbda6589a0926d134dc3149b6a
    private ProductType type;
}
