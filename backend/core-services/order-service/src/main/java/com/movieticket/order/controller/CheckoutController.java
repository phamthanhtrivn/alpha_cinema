package com.movieticket.order.controller;

import com.movieticket.order.common.ApiResponse;
import com.movieticket.order.dto.request.CreateCheckoutSessionRequest;
import com.movieticket.order.dto.request.UpdateCheckoutSessionRequest;
import com.movieticket.order.dto.response.CheckoutConfirmResponse;
import com.movieticket.order.dto.response.CheckoutSessionResponse;
import com.movieticket.order.service.CheckoutSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkouts")
@RequiredArgsConstructor
public class CheckoutController {
    private final CheckoutSessionService checkoutSessionService;

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
            @PathVariable String sessionId
    ) {
        CheckoutConfirmResponse response = checkoutSessionService.confirmSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(response, "Draft order created successfully"));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> cancelSession(@PathVariable String sessionId) {
        checkoutSessionService.cancelSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Checkout session cancelled successfully"));
    }
}
