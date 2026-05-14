package com.movieticket.payment.service;

import com.movieticket.payment.dto.response.PaymentSnapshot;
import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentLookupService {
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public List<PaymentSnapshot> findByOrderIds(Collection<String> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return List.of();
        }

        return paymentRepository.findByOrderIdIn(orderIds).stream()
                .map(this::toSnapshot)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> searchOrderIds(String method, String status, String paymentCode, String providerTransactionId) {
        return paymentRepository.findAll().stream()
                .filter(payment -> matchesEnum(payment.getMethod(), method))
                .filter(payment -> matchesEnum(payment.getStatus(), status))
                .filter(payment -> contains(payment.getPaymentCode(), paymentCode))
                .filter(payment -> contains(payment.getProviderTransactionId(), providerTransactionId))
                .map(Payment::getOrderId)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
    }

    private PaymentSnapshot toSnapshot(Payment payment) {
        return PaymentSnapshot.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .paymentCode(payment.getPaymentCode())
                .providerTransactionId(payment.getProviderTransactionId())
                .providerResponse(payment.getProviderResponse())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .paidAt(payment.getPaidAt())
                .expiredAt(payment.getExpiredAt())
                .build();
    }

    private boolean matchesEnum(Enum<?> value, String filter) {
        return !StringUtils.hasText(filter) || (value != null && value.name().equalsIgnoreCase(filter.trim()));
    }

    private boolean contains(String value, String filter) {
        return !StringUtils.hasText(filter)
                || (value != null && value.toLowerCase().contains(filter.trim().toLowerCase()));
    }
}
