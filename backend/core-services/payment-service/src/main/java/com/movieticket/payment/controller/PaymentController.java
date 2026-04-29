package com.movieticket.payment.controller;

import com.movieticket.payment.common.ApiResponse;
import com.movieticket.payment.dto.request.InitiatePaymentRequest;
import com.movieticket.payment.dto.request.PaymentRequest;
import com.movieticket.payment.dto.response.InitiatePaymentResponse;
import com.movieticket.payment.dto.response.MoMoResponse;
import com.movieticket.payment.service.PaymentService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders/{orderId}/initiate")
    public ResponseEntity<ApiResponse<InitiatePaymentResponse>> initiatePayment(
            @PathVariable String orderId,
            @Valid @RequestBody InitiatePaymentRequest request,
            HttpServletRequest httpServletRequest
    ) {
        InitiatePaymentResponse response = paymentService.initiatePayment(orderId, request, httpServletRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Khởi tạo thanh toán thành công"));
    }

    @GetMapping("/vn-pay-callback")
    public void payCallbackHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        paymentService.handleVnPayCallback(request, response);
    }
}