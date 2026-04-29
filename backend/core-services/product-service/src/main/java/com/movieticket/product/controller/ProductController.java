package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.dto.request.CreateProductDto;
import com.movieticket.product.dto.request.SearchProductDto;
import com.movieticket.product.dto.request.UpdateProductDto;
import com.movieticket.product.entity.Product;
import com.movieticket.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @ModelAttribute SearchProductDto searchProductDto
            ) {
        Page<Product> products = productService.searchProducts(PageRequest.of(page, size), searchProductDto);
        ApiResponse<Page<Product>> response = ApiResponse.success(products, "Products retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        ApiResponse<Product> response = ApiResponse.success(product, "Product retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<Product>>> getProductsByIds(@RequestBody List<String> ids) {
        List<Product> products = productService.getProductsByIds(ids);
        ApiResponse<List<Product>> response = ApiResponse.success(products, "Products retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @Valid @RequestPart("product")CreateProductDto createProductDto,
            @RequestPart("imageFile") MultipartFile imageFile
            ) {
        Product createdProduct = productService.createProduct(createProductDto, imageFile);
        ApiResponse<Product> response = ApiResponse.success(createdProduct, "Product created successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Product deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable String id,
            @Valid @RequestPart("product") UpdateProductDto updateProductDto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        Product updatedProduct = productService.updateProduct(id, updateProductDto, imageFile);
        ApiResponse<Product> response = ApiResponse.success(updatedProduct, "Product updated successfully");
        return ResponseEntity.ok(response);
    }
}
