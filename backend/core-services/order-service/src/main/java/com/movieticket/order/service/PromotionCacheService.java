package com.movieticket.order.service;

import com.movieticket.order.entity.Promotion;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.model.cache.PromotionCache;
import com.movieticket.order.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PromotionCacheService {
    private final PromotionRepository promotionRepository;

    public PromotionCache getPromotion(String promotionCode) {
        if (promotionCode == null || promotionCode.isBlank()) {
            return null;
        }

        String normalizedCode = promotionCode.trim().toUpperCase();
        Promotion promotion = promotionRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new BusinessException("Promotion not found: " + normalizedCode));

        PromotionCache promotionCache = toPromotionCache(promotion);
        validatePromotion(promotionCache);
        return promotionCache;
    }

    public Promotion getPromotionEntity(String promotionCode) {
        if (promotionCode == null || promotionCode.isBlank()) {
            return null;
        }

        Promotion promotion = promotionRepository.findByCodeIgnoreCase(promotionCode.trim())
                .orElseThrow(() -> new BusinessException("Promotion not found: " + promotionCode));
        validatePromotion(toPromotionCache(promotion));
        return promotion;
    }

    private void validatePromotion(PromotionCache promotion) {
        LocalDateTime now = LocalDateTime.now();
        if (!promotion.isStatus()) {
            throw new BusinessException("Promotion is inactive: " + promotion.getCode());
        }
        if (promotion.getStartDate() != null && now.isBefore(promotion.getStartDate())) {
            throw new BusinessException("Promotion is not active yet: " + promotion.getCode());
        }
        if (promotion.getEndDate() != null && now.isAfter(promotion.getEndDate())) {
            throw new BusinessException("Promotion has expired: " + promotion.getCode());
        }
        if (promotion.getRemainingQuantity() <= 0) {
            throw new BusinessException("Promotion is out of stock: " + promotion.getCode());
        }
    }

    private PromotionCache toPromotionCache(Promotion promotion) {
        return PromotionCache.builder()
                .id(promotion.getId())
                .code(promotion.getCode())
                .discount(promotion.getDiscount())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .remainingQuantity(promotion.getRemainingQuantity())
                .status(promotion.isStatus())
                .build();
    }
}
