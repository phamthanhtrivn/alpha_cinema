package com.movieticket.order.controller;

import com.movieticket.order.common.ApiResponse;
import com.movieticket.order.dto.PromotionCreateRequest;
import com.movieticket.order.dto.PromotionUpdateRequest;
import com.movieticket.order.entity.Promotion;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/promotions")
public class PromotionController {
    @Autowired
    private PromotionService promotionService;
    @GetMapping("/page")
    public ApiResponse<Page<Promotion>> getAllPromotions(
            @RequestParam(required = false) String code,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,    // Trường mặc định
            @RequestParam(defaultValue = "desc") String direction       // Hướng mặc định
    ) {
       try{
              Page<Promotion> promotions = promotionService.getPromotionsAndPage(code, page, size, sortBy, direction);
              return ApiResponse.success(promotions, "Lấy danh sách khuyến mãi thành công");
       } catch (Exception e) {
              return ApiResponse.fail("Lỗi khi lấy danh sách khuyến mãi: " + e.getMessage());
       }
    }

    @PostMapping("/create")
    public ApiResponse<?> createPromotion(@RequestBody @Valid PromotionCreateRequest promotionCreateRequest) {
        try{
            Promotion promotion = promotionService.createPromotion(promotionCreateRequest);
            return ApiResponse.success(promotion, "Tạo khuyến mãi thành công");
        } catch (BusinessException e) {
            return ApiResponse.fail("Lỗi khi tạo khuyến mãi: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ApiResponse<?> updatePromotion(@RequestBody @Valid PromotionUpdateRequest promotionUpdateRequest) {
        try{
            Promotion promotion = promotionService.editPromotion(promotionUpdateRequest);
            return ApiResponse.success(promotion, "Cập nhật khuyến mãi thành công");
        } catch (BusinessException e) {
            return ApiResponse.fail("Lỗi khi cap nhat khuyến mãi: " + e.getMessage());
        }
    }

}
