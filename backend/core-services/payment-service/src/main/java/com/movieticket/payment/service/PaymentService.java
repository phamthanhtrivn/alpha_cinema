package com.movieticket.payment.service;

import com.movieticket.payment.dto.request.InitiatePaymentRequest;
import com.movieticket.payment.dto.response.InitiatePaymentResponse;
import com.movieticket.payment.dto.response.PaymentResultResponse;
import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.enums.PaymentMethod;
import com.movieticket.payment.enums.PaymentStatus;
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

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.security.MessageDigest;

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

    @Value("${payment.result-token-secret:movie-ticket-payment-result-secret}")
    private String resultTokenSecret;

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
        PaymentStatus resultStatus = processPaymentResult(callbackResult, method);
        redirectToFrontend(response, callbackResult.getOrderId(), resultStatus);
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

    private PaymentStatus processPaymentResult(PaymentCallbackResult callbackResult, PaymentMethod method) {
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
            return PaymentStatus.EXPIRED;
        }

        if (PaymentStatus.SUCCESS.equals(payment.getStatus())) {
            return PaymentStatus.SUCCESS;
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
        return saved.getStatus();
    }

    private void redirectToFrontend(HttpServletResponse response, String orderId, PaymentStatus status) throws IOException {
        String encodedToken = URLEncoder.encode(createResultToken(orderId, status), StandardCharsets.UTF_8);
        if (PaymentStatus.SUCCESS.equals(status)) {
            response.sendRedirect(frontendUrl + "/payment/success?token=" + encodedToken);
            return;
        }
        response.sendRedirect(frontendUrl + "/payment/failed?token=" + encodedToken);
    }

    @Transactional(readOnly = true)
    public PaymentResultResponse getPaymentResult(String token) {
        PaymentResultPayload payload = verifyResultToken(token);
        Payment payment = paymentRepository.findByOrderId(payload.orderId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thanh toán của đơn hàng"));

        if (!payment.getStatus().name().equals(payload.status())) {
            throw new BusinessException("Trạng thái thanh toán không hợp lệ");
        }

        return PaymentResultResponse.builder()
                .orderId(payment.getOrderId())
                .status(payment.getStatus().name())
                .success(PaymentStatus.SUCCESS.equals(payment.getStatus()))
                .method(payment.getMethod() == null ? null : payment.getMethod().name())
                .amount(payment.getAmount())
                .providerTransactionId(payment.getProviderTransactionId())
                .message(payment.getProviderResponse())
                .paidAt(payment.getPaidAt())
                .build();
    }

    private String createResultToken(String orderId, PaymentStatus status) {
        long expiresAt = LocalDateTime.now().plusMinutes(30).toEpochSecond(ZoneOffset.UTC);
        String payload = String.join("|", orderId == null ? "" : orderId, status.name(), String.valueOf(expiresAt));
        return base64Url(payload.getBytes(StandardCharsets.UTF_8)) + "." + base64Url(sign(payload));
    }

    private PaymentResultPayload verifyResultToken(String token) {
        if (token == null || token.isBlank() || !token.contains(".")) {
            throw new BusinessException("Liên kết kết quả thanh toán không hợp lệ");
        }

        String payload;
        byte[] actualSignature;
        try {
            String[] parts = token.split("\\.", 2);
            payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            actualSignature = Base64.getUrlDecoder().decode(parts[1]);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Liên kết kết quả thanh toán không hợp lệ");
        }

        byte[] expectedSignature = sign(payload);

        if (!MessageDigest.isEqual(expectedSignature, actualSignature)) {
            throw new BusinessException("Liên kết kết quả thanh toán không hợp lệ");
        }

        String[] values = payload.split("\\|", 3);
        if (values.length != 3 || values[0].isBlank() || values[1].isBlank()) {
            throw new BusinessException("Liên kết kết quả thanh toán không hợp lệ");
        }

        long expiresAt;
        try {
            expiresAt = Long.parseLong(values[2]);
        } catch (NumberFormatException ex) {
            throw new BusinessException("Liên kết kết quả thanh toán không hợp lệ");
        }
        if (LocalDateTime.now().toEpochSecond(ZoneOffset.UTC) > expiresAt) {
            throw new BusinessException("Liên kết kết quả thanh toán đã hết hạn");
        }

        return new PaymentResultPayload(values[0], values[1]);
    }

    private byte[] sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(resultTokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new BusinessException("Không thể xác thực kết quả thanh toán");
        }
    }

    private String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private record PaymentResultPayload(String orderId, String status) {
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
