package com.movieticket.payment.service.strategy;

import com.movieticket.payment.config.VNPayConfig;
import com.movieticket.payment.dto.request.InitiatePaymentRequest;
import com.movieticket.payment.dto.response.InitiatePaymentResponse;
import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.entity.PaymentMethod;
import com.movieticket.payment.entity.PaymentStatus;
import com.movieticket.payment.util.PaymentUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class VNPayPaymentStrategy implements PaymentStrategy {

    private final VNPayConfig vnPayConfig;

    @Override
    public PaymentMethod supportedMethod() {
        return PaymentMethod.VNPAY;
    }

    @Override
    public InitiatePaymentResponse initiate(Payment payment, InitiatePaymentRequest request, HttpServletRequest httpRequest) {
        String paymentUrl = buildVnPayUrl(payment, request.getBankCode(), PaymentUtil.getIpAddress(httpRequest));
        payment.setProviderResponse("VNPay payment url generated");
        return InitiatePaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .message("VNPay payment url generated")
                .build();
    }

    @Override
    public PaymentCallbackResult parseCallback(HttpServletRequest request) throws IOException {
        String responseCode = request.getParameter("vnp_ResponseCode");

        return PaymentCallbackResult.builder()
                .orderId(request.getParameter("vnp_TxnRef"))
                .providerTransactionId(request.getParameter("vnp_TransactionNo"))
                .providerResponse("VNPay responseCode=" + responseCode)
                .status(mapStatus(responseCode))
                .build();
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

    private PaymentStatus mapStatus(String responseCode) {
        if ("00".equals(responseCode)) {
            return PaymentStatus.SUCCESS;
        }
        if ("24".equals(responseCode)) {
            return PaymentStatus.CANCELLED;
        }
        if ("11".equals(responseCode)) {
            return PaymentStatus.EXPIRED;
        }
        return PaymentStatus.FAILED;
    }
}