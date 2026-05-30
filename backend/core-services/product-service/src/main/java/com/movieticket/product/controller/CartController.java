package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.dto.request.CartItemRequestDTO;
import com.movieticket.product.dto.response.CartItemResponseDTO;
import com.movieticket.product.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemResponseDTO>>> getCart(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId), "Lấy giỏ hàng thành công"));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Void>> addToCart(@RequestHeader("X-User-Id") String userId,
                                          @Valid @RequestBody CartItemRequestDTO request) {
        cartService.addToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Thêm vào giỏ hàng thành công"));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateCartItem(@RequestHeader("X-User-Id") String userId,
                                               @Valid @RequestBody CartItemRequestDTO request) {
        cartService.updateCartItem(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật giỏ hàng thành công"));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeCartItem(@RequestHeader("X-User-Id") String userId,
                                               @PathVariable String productId) {
        cartService.removeCartItem(userId, productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xoá sản phẩm khỏi giỏ hàng thành công"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(@RequestHeader("X-User-Id") String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xoá toàn bộ giỏ hàng thành công"));
    }
}
