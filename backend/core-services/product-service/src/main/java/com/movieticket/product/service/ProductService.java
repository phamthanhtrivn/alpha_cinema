package com.movieticket.product.service;

import com.movieticket.product.dto.CreateProductDto;
import com.movieticket.product.entity.Product;
import com.movieticket.product.exception.BusinessException;
import com.movieticket.product.repository.ProductRepository;
import com.movieticket.product.util.CloudinaryUtil;
import com.movieticket.product.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final CloudinaryUtil cloudinaryUtil;
    private final ProductRepository productRepository;

    public Product createProduct(CreateProductDto createProductDto, MultipartFile file) {
        if (productRepository.existsByNameAndUnitPrice(createProductDto.getName(), createProductDto.getUnitPrice())) {
            throw new BusinessException("Product with the same name and price already exists");
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Product image is required");
        }

        String pictureUrl = cloudinaryUtil.uploadImage(file);

        Product product = new Product();
        product.setId(IdGenerator.generateProductId());
        product.setName(createProductDto.getName());
        product.setUnitPrice(createProductDto.getUnitPrice());
        product.setDescription(createProductDto.getDescription());
        product.setPictureUrl(pictureUrl);
        product.setStatus(true);

        return productRepository.save(product);
    }
}
