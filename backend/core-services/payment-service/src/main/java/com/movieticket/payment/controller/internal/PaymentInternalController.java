package com.movieticket.payment.controller.internal;

import com.movieticket.payment.dto.response.PaymentSnapshot;
import com.movieticket.payment.service.PaymentLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal/payments")
@RequiredArgsConstructor
public class PaymentInternalController {
    private final PaymentLookupService paymentLookupService;

    @PostMapping("/by-order-ids")
    public ResponseEntity<List<PaymentSnapshot>> getByOrderIds(@RequestBody List<String> orderIds) {
        return ResponseEntity.ok(paymentLookupService.findByOrderIds(orderIds));
    }

    @GetMapping("/order-ids")
    public ResponseEntity<List<String>> searchOrderIds(
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentCode,
            @RequestParam(required = false) String providerTransactionId
    ) {
        return ResponseEntity.ok(paymentLookupService.searchOrderIds(method, status, paymentCode, providerTransactionId));
    }
}
