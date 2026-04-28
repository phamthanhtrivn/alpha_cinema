package com.movieticket.order.service;

import com.movieticket.order.dto.PromotionCreateRequest;
import com.movieticket.order.dto.PromotionUpdateRequest;
import com.movieticket.order.entity.Promotion;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class PromotionService {
    @Autowired
    private PromotionRepository promotionRepository;
    public Page<Promotion> getPromotionsAndPage(String code, int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        if (code != null && !code.trim().isEmpty()) {
            return promotionRepository.findByCodeContainingIgnoreCase(code.trim(), pageable);
        }
        return promotionRepository.findAll(pageable);
    }

    public Promotion createPromotion(PromotionCreateRequest promotionCreateRequest){
        if(promotionCreateRequest.getStartDate().isAfter(promotionCreateRequest.getEndDate())){
            throw new BusinessException("Start date phải trước end date");
        }
        Promotion promotion = Promotion.builder()
                .code(promotionCreateRequest.getCode())
                .discount(promotionCreateRequest.getDiscount())
                .startDate(promotionCreateRequest.getStartDate())
                .endDate(promotionCreateRequest.getEndDate())
                .quantity(promotionCreateRequest.getQuantity())
                .remainingQuantity(promotionCreateRequest.getQuantity()) // Khởi tạo remainingQuantity bằng quantity
                .status(promotionCreateRequest.getStatus())
                .build();
        return promotionRepository.save(promotion);
    }

    public Promotion editPromotion(PromotionUpdateRequest promotionUpdateRequest){
        if(promotionUpdateRequest.getStartDate().isAfter(promotionUpdateRequest.getEndDate())){
            throw new BusinessException("Start date phải trước end date");
        }
        Promotion existingPromotion = promotionRepository.findById(promotionUpdateRequest.getId())
                .orElseThrow(() -> new BusinessException("Promotion không tồn tại"));
        existingPromotion.setCode(promotionUpdateRequest.getCode());
        existingPromotion.setDiscount(promotionUpdateRequest.getDiscount());
        existingPromotion.setStartDate(promotionUpdateRequest.getStartDate());
        existingPromotion.setEndDate(promotionUpdateRequest.getEndDate());
        existingPromotion.setQuantity(promotionUpdateRequest.getQuantity());
        existingPromotion.setRemainingQuantity(existingPromotion.getRemainingQuantity() + (promotionUpdateRequest.getQuantity() - existingPromotion.getQuantity()));
        existingPromotion.setStatus(promotionUpdateRequest.getStatus());
        return promotionRepository.save(existingPromotion);
    }
}
