package com.movieticket.order.controller;

import com.movieticket.order.common.ApiResponse;
import com.movieticket.order.dto.request.ConfirmCheckoutSessionRequest;
import com.movieticket.order.dto.client.PaymentInitiateSnapshot;
import com.movieticket.order.dto.request.CreateCheckoutSessionRequest;
import com.movieticket.order.dto.request.UpdateCheckoutSessionRequest;
import com.movieticket.order.dto.response.CheckoutConfirmResponse;
import com.movieticket.order.dto.response.CheckoutSessionResponse;
import com.movieticket.order.service.CheckoutSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import com.movieticket.order.dto.CheckoutEmployeeRequest;
import com.movieticket.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkouts")
@RequiredArgsConstructor
public class CheckoutController {
    private final CheckoutSessionService checkoutSessionService;
    private final OrderService orderService;

    @PostMapping("/payment-by-cash")
    public ResponseEntity<ApiResponse<?>> paymentByCash(
            @RequestHeader("X-User-Id") String userID,
            @RequestHeader("X-Cinema-Id") String cinemaID,
            @RequestBody(required = true) CheckoutEmployeeRequest request
    ) {
        String id = orderService.paymentByCash(userID, cinemaID, request);
        if (!id.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(id, "Payment by cash successful"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Payment failed"));
        }
    }

    @PostMapping("/payment-by-momo")
    public ResponseEntity<ApiResponse<PaymentInitiateSnapshot>> paymentByMomo(
            @RequestHeader("X-User-Id") String userID,
            @RequestHeader("X-Cinema-Id") String cinemaID,
            @RequestHeader(value = "X-User-IP", required = false) String userIp,
            @RequestBody(required = true) CheckoutEmployeeRequest request
    ) {
        PaymentInitiateSnapshot response = orderService.paymentByMomo(userID, cinemaID, request, userIp);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment by MoMo initiated"));
    }
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<CheckoutSessionResponse>> createSession(
            @Valid @RequestBody CreateCheckoutSessionRequest request
    ) {
        CheckoutSessionResponse response = checkoutSessionService.createSession(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Checkout session created successfully"));
    }

    @PutMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<CheckoutSessionResponse>> updateSession(
            @PathVariable String sessionId,
            @Valid @RequestBody UpdateCheckoutSessionRequest request
    ) {
        CheckoutSessionResponse response = checkoutSessionService.updateSession(sessionId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Checkout session updated successfully"));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<CheckoutSessionResponse>> getSession(@PathVariable String sessionId) {
        CheckoutSessionResponse response = checkoutSessionService.getSessionDetail(sessionId);
        return ResponseEntity.ok(ApiResponse.success(response, "Checkout session retrieved successfully"));
    }

    @PostMapping("/sessions/{sessionId}/confirm")
    public ResponseEntity<ApiResponse<CheckoutConfirmResponse>> confirmSession(
            @PathVariable String sessionId,
            @Valid @RequestBody ConfirmCheckoutSessionRequest request,
            @RequestHeader(value = "X-User-IP", required = false) String userIp
    ) {
        CheckoutConfirmResponse response = checkoutSessionService.confirmSession(sessionId, request, userIp);
        return ResponseEntity.ok(ApiResponse.success(response, "Draft order created successfully"));
    }

    @PostMapping("/sessions/{sessionId}/confirm-zero-payment")
    public ResponseEntity<ApiResponse<CheckoutConfirmResponse>> confirmZeroPaymentSession(
            @PathVariable String sessionId
    ) {
        CheckoutConfirmResponse response = checkoutSessionService.confirmZeroPaymentSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(response, "Zero-payment order confirmed successfully"));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> cancelSession(@PathVariable String sessionId){
            checkoutSessionService.cancelSession(sessionId);
            return ResponseEntity.ok(ApiResponse.success(null, "Checkout session cancelled successfully"));
    }
}
