package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.dto.CreateProductDto;
import com.movieticket.product.entity.Product;
import com.movieticket.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @Valid @RequestPart("product")CreateProductDto createProductDto,
            @RequestPart("imageFile") MultipartFile imageFile
            ) {
        Product createdProduct = productService.createProduct(createProductDto, imageFile);
        ApiResponse<Product> response = ApiResponse.success(createdProduct, "Product created successfully");
        return ResponseEntity.ok(response);
    }
}
