package com.movieticket.product.service;

import com.movieticket.product.dto.CreateProductDto;
import com.movieticket.product.dto.SearchProductDto;
import com.movieticket.product.dto.UpdateProductDto;
import com.movieticket.product.entity.Product;
import com.movieticket.product.exception.BusinessException;
import com.movieticket.product.repository.ProductRepository;
import com.movieticket.product.util.CloudinaryUtil;
import com.movieticket.product.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final CloudinaryUtil cloudinaryUtil;
    private final ProductRepository productRepository;

    public Page<Product> searchProducts(Pageable pageable, SearchProductDto searchProductDto) {
        return productRepository.filterProducts(
                searchProductDto.getId(), 
                searchProductDto.getName(),
                searchProductDto.getMinPrice(),
                searchProductDto.getMaxPrice(),
                searchProductDto.getType(),
                searchProductDto.getStatus(),
                pageable
        );
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Product not found with id: " + id));
    }

    public List<Product> getProductsByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        List<String> distinctIds = ids.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .collect(Collectors.collectingAndThen(Collectors.toCollection(LinkedHashSet::new), List::copyOf));

        if (distinctIds.isEmpty()) {
            return List.of();
        }

        Map<String, Product> productsById = productRepository.findAllById(distinctIds).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        for (String id : distinctIds) {
            if (!productsById.containsKey(id)) {
                throw new BusinessException("Product not found with id: " + id);
            }
        }

        return distinctIds.stream()
                .map(productsById::get)
                .toList();
    }

    public Product createProduct(CreateProductDto createProductDto, MultipartFile file) {
        if (productRepository.existsByNameAndUnitPrice(createProductDto.getName(), createProductDto.getUnitPrice())) {
            throw new BusinessException("Sản phẩm đã tồn tại");
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Ảnh sản phẩm không được để trống");
        }

        String pictureUrl = cloudinaryUtil.uploadImage(file);

        Product product = new Product();
        product.setId(IdGenerator.generateProductId());
        product.setName(createProductDto.getName());
        product.setUnitPrice(createProductDto.getUnitPrice());
        product.setDescription(createProductDto.getDescription());
        product.setType(createProductDto.getType());
        product.setPictureUrl(pictureUrl);
        product.setStatus(true);

        return productRepository.save(product);
    }

    public void deleteProduct(String id) {
        Product product = getProductById(id);
        cloudinaryUtil.deleteByUrl(product.getPictureUrl());
        productRepository.delete(product);
    }

    public Product updateProduct(String id, UpdateProductDto updateProductDto, MultipartFile file) {
        Product product = getProductById(id);

        if (productRepository.existsByNameAndUnitPriceAndIdNot(updateProductDto.getName(), updateProductDto.getUnitPrice(), id)) {
            throw new BusinessException("Sản phẩm đã tồn tại");
        }

        if (file != null && !file.isEmpty()) {
            cloudinaryUtil.deleteByUrl(product.getPictureUrl());
            String pictureUrl = cloudinaryUtil.uploadImage(file);
            product.setPictureUrl(pictureUrl);
        }

        product.setName(updateProductDto.getName());
        product.setUnitPrice(updateProductDto.getUnitPrice());
        product.setDescription(updateProductDto.getDescription());
        product.setType(updateProductDto.getType() );
        product.setStatus(updateProductDto.isStatus());

        return productRepository.save(product);
    }
}
