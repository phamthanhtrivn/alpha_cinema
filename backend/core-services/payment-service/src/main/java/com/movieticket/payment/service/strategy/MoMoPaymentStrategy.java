package com.movieticket.payment.service.strategy;

import com.movieticket.payment.client.MoMoApi;
import com.movieticket.payment.config.MoMoConfig;
import com.movieticket.payment.dto.request.InitiatePaymentRequest;
import com.movieticket.payment.dto.request.MoMoRequest;
import com.movieticket.payment.dto.response.InitiatePaymentResponse;
import com.movieticket.payment.dto.response.MoMoResponse;
import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.enums.PaymentMethod;
import com.movieticket.payment.enums.PaymentStatus;
import com.movieticket.payment.exception.BusinessException;
import com.movieticket.payment.util.PaymentUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MoMoPaymentStrategy implements PaymentStrategy {

    private final MoMoConfig momoConfig;
    private final MoMoApi moMoApi;

    @Override
    public PaymentMethod supportedMethod() {
        return PaymentMethod.MOMO;
    }

    @Override
    public InitiatePaymentResponse initiate(Payment payment, InitiatePaymentRequest request, HttpServletRequest httpRequest) {
        String requestId = UUID.randomUUID().toString();
        String callbackUrl = momoConfig.getReturnUrl();
        String orderInfo = "Thanh toán đơn đặt vé: " + payment.getOrderId();
        long amount = Math.round(payment.getAmount());

        String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                momoConfig.getAccessKey(),
                amount,
                "",
                callbackUrl,
                payment.getOrderId(),
                orderInfo,
                momoConfig.getPartnerCode(),
                callbackUrl,
                requestId,
                momoConfig.getRequestType()
        );

        String signature = PaymentUtil.hmacSHA256(momoConfig.getSecretKey(), rawSignature);

        MoMoRequest momoRequest = MoMoRequest.builder()
                .partnerCode(momoConfig.getPartnerCode())
                .requestType(momoConfig.getRequestType())
                .ipnUrl(callbackUrl)
                .redirectUrl(callbackUrl)
                .orderId(payment.getOrderId())
                .orderInfo(orderInfo)
                .amount(amount)
                .requestId(requestId)
                .lang("vi")
                .extraData("")
                .signature(signature)
                .build();

        MoMoResponse momoResponse = moMoApi.createMoMoQR(momoRequest);
        if (momoResponse == null) {
            throw new BusinessException("Không thể tạo yêu cầu thanh toán MoMo");
        }

        String paymentUrl = firstNonBlank(momoResponse.getPayUrl(), momoResponse.getDeeplink(), momoResponse.getQrCodeUrl());
        if (paymentUrl == null) {
            throw new BusinessException("MoMo không trả về URL thanh toán hợp lệ");
        }

        payment.setProviderResponse(momoResponse.getMessage());
        return InitiatePaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .qrCodeUrl(momoResponse.getQrCodeUrl())
                .deeplink(momoResponse.getDeeplink())
                .message(momoResponse.getMessage() == null ? "MoMo payment url generated" : momoResponse.getMessage())
                .build();
    }

    @Override
    public PaymentCallbackResult parseCallback(HttpServletRequest request) throws IOException {
        String resultCode = request.getParameter("resultCode");

        return PaymentCallbackResult.builder()
                .orderId(request.getParameter("orderId"))
                .providerTransactionId(firstNonBlank(request.getParameter("transId"), request.getParameter("requestId")))
                .providerResponse(firstNonBlank(request.getParameter("message"), "MoMo resultCode=" + resultCode))
                .status(mapStatus(resultCode))
                .build();
    }

    private PaymentStatus mapStatus(String resultCode) {
        if ("0".equals(resultCode)) {
            return PaymentStatus.SUCCESS;
        }
        if ("1006".equals(resultCode)) {
            return PaymentStatus.CANCELLED;
        }
        if ("1005".equals(resultCode)) {
            return PaymentStatus.EXPIRED;
        }
        return PaymentStatus.FAILED;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}