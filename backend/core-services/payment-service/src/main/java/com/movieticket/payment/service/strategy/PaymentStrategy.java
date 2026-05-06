package com.movieticket.payment.service.strategy;

import com.movieticket.payment.dto.request.InitiatePaymentRequest;
import com.movieticket.payment.dto.response.InitiatePaymentResponse;
import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.entity.PaymentMethod;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;

public interface PaymentStrategy {
    PaymentMethod supportedMethod();

    InitiatePaymentResponse initiate(Payment payment, InitiatePaymentRequest request, HttpServletRequest httpRequest);

    PaymentCallbackResult parseCallback(HttpServletRequest request) throws IOException;
}