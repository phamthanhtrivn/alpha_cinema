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
            "api/show-schedules/public"
    );
    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));
}
