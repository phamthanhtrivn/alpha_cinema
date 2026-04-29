package com.movieticket.payment.service;

import com.movieticket.payment.dto.request.InitiatePaymentRequest;
import com.movieticket.payment.dto.response.InitiatePaymentResponse;
import com.movieticket.payment.config.VNPayConfig;
import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.entity.PaymentMethod;
import com.movieticket.payment.entity.PaymentStatus;
import com.movieticket.payment.event.model.PaymentResultEvent;
import com.movieticket.payment.event.producer.PaymentResultEventProducer;
import com.movieticket.payment.exception.BusinessException;
import com.movieticket.payment.repository.PaymentRepository;
import com.movieticket.payment.util.PaymentUtil;
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
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final VNPayConfig vnPayConfig;
    private final PaymentRepository paymentRepository;
    private final PaymentResultEventProducer paymentResultEventProducer;

    @Value("${payment.frontend-base-url}")
    private String frontendUrl;

    @Transactional
    public InitiatePaymentResponse initiatePayment(String orderId, InitiatePaymentRequest request, HttpServletRequest httpRequest) {
        Payment payment = paymentRepository.findByOrderId(orderId)
            .orElseGet(() -> createPaymentFromInitiateRequest(orderId, request));

        if (PaymentStatus.SUCCESS.equals(payment.getStatus())) {
            throw new BusinessException("Đơn hàng đã được thanh toán thành công, không thể tạo lại thanh toán");
        }

        payment.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        payment.setPaymentCode("PAY_" + UUID.randomUUID());
        payment.setMethod(request.getMethod());
        payment.setStatus(PaymentStatus.PENDING);

        if (PaymentMethod.VNPAY.equals(request.getMethod())) {
            String paymentUrl = buildVnPayUrl(httpRequest, payment, request.getBankCode());
            payment.setProviderResponse("VNPay payment url generated");
            Payment saved = paymentRepository.save(payment);
            return InitiatePaymentResponse.builder()
                    .paymentId(saved.getId())
                    .orderId(saved.getOrderId())
                    .method(saved.getMethod().name())
                    .status(saved.getStatus().name())
                    .paymentUrl(paymentUrl)
                    .message("VNPay payment url generated")
                    .build();
        }
        else {
            throw new BusinessException("Phương thức thanh toán không được hỗ trợ");
        }
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
        return paymentRepository.save(payment);
    }

    @Transactional
    public void handleVnPayCallback(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String responseCode = request.getParameter("vnp_ResponseCode");
        String orderId = request.getParameter("vnp_TxnRef");
        String providerTransactionId = request.getParameter("vnp_TransactionNo");

        boolean success = "00".equals(responseCode);
        processPaymentResult(orderId, PaymentMethod.VNPAY, success, providerTransactionId, "VNPay responseCode=" + responseCode);
        redirectToFrontend(response, orderId, success);
    }


    private String buildVnPayUrl(HttpServletRequest request, Payment payment, String bankCode) {
        return buildVnPayUrl(payment, bankCode, PaymentUtil.getIpAddress(request));
    }

    private String buildVnPayUrl(Payment payment, String bankCode, String ipAddress) {
        long amount = Math.round(payment.getAmount() * 100L);
        Map<String, String> vnpParamsMap = vnPayConfig.getVNPayConfig(payment.getOrderId());
        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));

        if (bankCode != null && !bankCode.isBlank()) {
            vnpParamsMap.put("vnp_BankCode", bankCode);
        }
        vnpParamsMap.put("vnp_IpAddr", ipAddress == null || ipAddress.isBlank() ? "127.0.0.1" : ipAddress);

        String queryUrl = PaymentUtil.getPaymentURL(vnpParamsMap, true);
        String hashData = PaymentUtil.getPaymentURL(vnpParamsMap, false);
        String vnpSecureHash = PaymentUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        return vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
    }

    private void processPaymentResult(
            String orderId,
            PaymentMethod method,
            boolean success,
            String providerTransactionId,
            String providerResponse
    ) {
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
        payment.setProviderTransactionId(providerTransactionId);
        payment.setProviderResponse(providerResponse);

        if (success) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
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
            response.sendRedirect(frontendUrl + "/payment/success?orderId=" + encodedOrderId);
            return;
        }
        response.sendRedirect(frontendUrl + "/payment/failed?orderId=" + encodedOrderId);
    }

}