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

    public Product createProduct(CreateProductDto createProductDto, MultipartFile file) {
        if (productRepository.existsByNameAndUnitPrice(createProductDto.getName(), createProductDto.getUnitPrice())) {
            throw new BusinessException("Sản phẩm với tên và giá đã tồn tại");
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Cần phải tải lên một hình ảnh cho sản phẩm");
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

        if (productRepository.existsByNameAndUnitPrice(updateProductDto.getName(), updateProductDto.getUnitPrice())) {
            throw new BusinessException("Sản phẩm với tên và giá đã tồn tại");
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
