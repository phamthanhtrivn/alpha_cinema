package com.movieticket.payment.service;

import com.movieticket.payment.dto.request.InitiatePaymentRequest;
import com.movieticket.payment.dto.response.InitiatePaymentResponse;
import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.entity.PaymentMethod;
import com.movieticket.payment.entity.PaymentStatus;
import com.movieticket.payment.event.model.PaymentResultEvent;
import com.movieticket.payment.event.producer.PaymentCashResultEventProducer;
import com.movieticket.payment.event.producer.PaymentResultEventProducer;
import com.movieticket.payment.exception.BusinessException;
import com.movieticket.payment.repository.PaymentRepository;
import com.movieticket.payment.service.strategy.PaymentCallbackResult;
import com.movieticket.payment.service.strategy.PaymentStrategy;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final List<PaymentStrategy> paymentStrategies;
    private final PaymentRepository paymentRepository;
    private final PaymentResultEventProducer paymentResultEventProducer;
    private final PaymentCashResultEventProducer paymentCashResultEventProducer;
    private Map<PaymentMethod, PaymentStrategy> paymentStrategyMap;

    @Value("${payment.frontend-base-url}")
    private String frontendUrl;

    @PostConstruct
    void init() {
        paymentStrategyMap = new EnumMap<>(PaymentMethod.class);
        for (PaymentStrategy strategy : paymentStrategies) {
            paymentStrategyMap.put(strategy.supportedMethod(), strategy);
        }
    }

    @Transactional
    public InitiatePaymentResponse initiatePayment(String orderId, InitiatePaymentRequest request,
            HttpServletRequest httpRequest) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> createPaymentFromInitiateRequest(orderId, request));

        if (PaymentStatus.SUCCESS.equals(payment.getStatus())) {
            throw new BusinessException("Đơn hàng đã được thanh toán thành công, không thể tạo lại thanh toán");
        }

        PaymentStrategy strategy = getStrategy(request.getMethod());
        payment.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        payment.setPaymentCode("PAY_" + UUID.randomUUID());
        payment.setMethod(request.getMethod());
        payment.setStatus(PaymentStatus.PENDING);

        InitiatePaymentResponse strategyResponse = strategy.initiate(payment, request, httpRequest);
        Payment saved = paymentRepository.save(payment);

        return InitiatePaymentResponse.builder()
                .paymentId(saved.getId())
                .orderId(saved.getOrderId())
                .method(saved.getMethod().name())
                .status(saved.getStatus().name())
                .paymentUrl(strategyResponse.getPaymentUrl())
                .qrCodeUrl(strategyResponse.getQrCodeUrl())
                .deeplink(strategyResponse.getDeeplink())
                .message(strategyResponse.getMessage())
                .build();
    }

    @Transactional
    public void handleVnPayCallback(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handleCallback(PaymentMethod.VNPAY, request, response);
    }

    @Transactional
    public void handleMoMoCallback(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handleCallback(PaymentMethod.MOMO, request, response);
    }

    private void handleCallback(PaymentMethod method, HttpServletRequest request, HttpServletResponse response) throws IOException {
        PaymentStrategy strategy = getStrategy(method);
        PaymentCallbackResult callbackResult = strategy.parseCallback(request);
        processPaymentResult(callbackResult, method);
        redirectToFrontend(response, callbackResult.getOrderId(), PaymentStatus.SUCCESS.equals(callbackResult.getStatus()));
    }

    private Payment createPaymentFromInitiateRequest(String orderId, InitiatePaymentRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0D) {
            throw new BusinessException("Amount is required to create payment for order: " + orderId);
        }

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(request.getAmount());
        payment.setCurrency("VND");
        payment.setMethod(request.getMethod());
        payment.setStatus(PaymentStatus.PENDING);
        return payment;
    }

    private PaymentStrategy getStrategy(PaymentMethod method) {
        PaymentStrategy strategy = paymentStrategyMap.get(method);
        if (strategy == null) {
            throw new BusinessException("Phương thức thanh toán không được hỗ trợ: " + method);
        }
        return strategy;
    }

    private void processPaymentResult(PaymentCallbackResult callbackResult, PaymentMethod method) {
        String orderId = callbackResult.getOrderId();
        if (orderId == null || orderId.isBlank()) {
            throw new BusinessException("Order id is required in callback");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException("Thanh toán không tìm thấy với đơn hàng: " + orderId));

        if (payment.getExpiredAt() != null && payment.getExpiredAt().isBefore(LocalDateTime.now())) {
            payment.setStatus(PaymentStatus.EXPIRED);
            payment.setProviderResponse("Payment expired");
            paymentRepository.save(payment);
            return;
        }

        if (PaymentStatus.SUCCESS.equals(payment.getStatus())) {
            return;
        }

        payment.setMethod(method);
        payment.setProviderTransactionId(callbackResult.getProviderTransactionId());
        payment.setProviderResponse(callbackResult.getProviderResponse());
        payment.setStatus(callbackResult.getStatus());

        if (PaymentStatus.SUCCESS.equals(callbackResult.getStatus())) {
            payment.setPaidAt(LocalDateTime.now());
        }

        Payment saved = paymentRepository.save(payment);
        paymentResultEventProducer.publish(PaymentResultEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .paymentId(saved.getId())
                .orderId(saved.getOrderId())
                .method(saved.getMethod() == null ? null : saved.getMethod().name())
                .status(saved.getStatus().name())
                .providerTransactionId(saved.getProviderTransactionId())
                .message(saved.getProviderResponse())
                .paidAt(saved.getPaidAt())
                .occurredAt(LocalDateTime.now())
                .build());
    }

    private void redirectToFrontend(HttpServletResponse response, String orderId, boolean success) throws IOException {
        String encodedOrderId = URLEncoder.encode(orderId == null ? "" : orderId, StandardCharsets.UTF_8);
        if (success) {
            response.sendRedirect(frontendUrl + "/profile?tab=history" + encodedOrderId);
            return;
        }
        response.sendRedirect(frontendUrl + "/payment/failed?orderId=" + encodedOrderId);
    }

    public boolean paymentByCash(String orderId, Double totalPayment) {
        try {
            Payment saved = paymentRepository.save(
                Payment.builder()
                    .orderId(orderId)
                    .amount(totalPayment)
                    .method(PaymentMethod.CASH)
                    .status(PaymentStatus.SUCCESS)
                    .paidAt(LocalDateTime.now())
                    .build());

            paymentCashResultEventProducer.publish(PaymentResultEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .paymentId(saved.getId())
                .orderId(saved.getOrderId())
                .method(saved.getMethod().name())
                .status(saved.getStatus().name())
                .message("Payment by cash successful")
                .paidAt(saved.getPaidAt())
                .occurredAt(LocalDateTime.now())
                .build());
            return true;
        } catch (Exception e) {
            System.out.println("Error processing payment: " + e.getMessage());
            paymentCashResultEventProducer.publish(PaymentResultEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .orderId(orderId)
                .method(PaymentMethod.CASH.name())
                .status(PaymentStatus.FAILED.name())
                .message("Payment by cash failed: " + e.getMessage())
                .occurredAt(LocalDateTime.now())
                .build());
            return false;
        }
    }

}
