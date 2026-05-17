package com.movieticket.payment.controller;

import com.movieticket.payment.common.ApiResponse;
import com.movieticket.payment.dto.request.InitiatePaymentRequest;
import com.movieticket.payment.dto.response.InitiatePaymentResponse;
import com.movieticket.payment.dto.response.PaymentResultResponse;
import com.movieticket.payment.service.PaymentService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController

@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders/{orderId}/initiate")
    public ResponseEntity<ApiResponse<InitiatePaymentResponse>> initiatePayment(
            @PathVariable String orderId,
            @Valid @RequestBody InitiatePaymentRequest request,
            HttpServletRequest httpServletRequest) {
        InitiatePaymentResponse response = paymentService.initiatePayment(orderId, request, httpServletRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Khởi tạo thanh toán thành công"));
    }

    @GetMapping("/vn-pay-callback")
    public void payCallbackHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        paymentService.handleVnPayCallback(request, response);
    }

    @RequestMapping(value = "/momo-pay-callback", method = {RequestMethod.GET, RequestMethod.POST})
    public void momoCallbackHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        paymentService.handleMoMoCallback(request, response);
    }

    @GetMapping("/result")
    public ResponseEntity<ApiResponse<PaymentResultResponse>> getPaymentResult(@RequestParam String token) {
        PaymentResultResponse response = paymentService.getPaymentResult(token);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment result retrieved successfully"));
    }

    @PostMapping("/payment-by-cash")
    public ResponseEntity<ApiResponse<?>> paymentByCash(String orderId, Double totalPayment) {
        System.out.println("Received payment by cash request for orderId: " + orderId + ", totalPayment: " + totalPayment);
        boolean result = paymentService.paymentByCash(orderId, totalPayment);
        if (result) {
            return ResponseEntity.ok(ApiResponse.success("null", "Payment by cash successful"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Payment failed"));
        }
    }
}
