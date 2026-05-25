package com.movieticket.gateway.config;


import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {
    public static final List<String> openApiEndpoints = List.of(
            "/api/users/register",
            "/api/users/login",
            "/api/users/refresh-token",
            "/api/users/forgot-password",
            "/api/users/forgot-password/otp",
            "/api/users/forgot-password/reset-password",
            "/api/users/google-login",
            "api/movies/public",
            "api/cinemas/public",
            "api/show-schedules/public",
            "api/promotions/public",
            "api/artists/public",
            "/api/payments/vn-pay-callback",
            "/api/payments/momo-pay-callback",
            "/api/payments/result",
            "/api/ai/chat",
            "/api/ai/chat/clear",
            "/api/ai/knowledge/ingest-policies",
            "/api/ai/knowledge/search",
            "/api/reviews/public/"
    );
    
    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));
}
