package com.movieticket.product.service;

import com.movieticket.product.dto.request.CartItemRequestDTO;
import com.movieticket.product.dto.response.CartItemResponseDTO;
import com.movieticket.product.entity.Product;
import com.movieticket.product.exception.BusinessException;
import com.movieticket.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CartService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductRepository productRepository;

    private static final String CART_KEY_PREFIX = "cart:user:";

    private String getCartKey(String userId) {
        return CART_KEY_PREFIX + userId;
    }

    public List<CartItemResponseDTO> getCart(String userId) {
        String key = getCartKey(userId);
        HashOperations<String, String, Integer> hashOps = redisTemplate.opsForHash();
        Map<String, Integer> cartItems = hashOps.entries(key);

        List<CartItemResponseDTO> response = new ArrayList<>();
        if (cartItems != null && !cartItems.isEmpty()) {
            List<Product> products = productRepository.findAllById(cartItems.keySet());
            for (Product product : products) {
                Integer quantity = cartItems.get(product.getId());
                if (quantity != null && quantity > 0) {
                    response.add(CartItemResponseDTO.builder()
                            .productId(product.getId())
                            .name(product.getName())
                            .unitPrice(product.getUnitPrice())
                            .pictureUrl(product.getPictureUrl())
                            .quantity(quantity)
                            .stockQty(product.getStockQty())
                            .build());
                }
            }
        }
        return response;
    }

    public void addToCart(String userId, CartItemRequestDTO dto) {
        // Validate product exists
        productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new BusinessException("Product not found"));

        String key = getCartKey(userId);
        HashOperations<String, String, Integer> hashOps = redisTemplate.opsForHash();
        
        Integer existingQty = hashOps.get(key, dto.getProductId());
        int newQty = existingQty == null ? dto.getQuantity() : existingQty + dto.getQuantity();
        
        hashOps.put(key, dto.getProductId(), newQty);
    }

    public void updateCartItem(String userId, CartItemRequestDTO dto) {
        productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new BusinessException("Product not found"));

        String key = getCartKey(userId);
        HashOperations<String, String, Integer> hashOps = redisTemplate.opsForHash();
        
        if (dto.getQuantity() <= 0) {
            hashOps.delete(key, dto.getProductId());
        } else {
            hashOps.put(key, dto.getProductId(), dto.getQuantity());
        }
    }

    public void removeCartItem(String userId, String productId) {
        String key = getCartKey(userId);
        HashOperations<String, String, Integer> hashOps = redisTemplate.opsForHash();
        hashOps.delete(key, productId);
    }

    public void clearCart(String userId) {
        String key = getCartKey(userId);
        redisTemplate.delete(key);
    }
}
