package com.movieticket.gateway.utils;

import org.springframework.http.server.reactive.ServerHttpRequest;

public class IpUtils {
    public static String resolveClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");

        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        if (request.getRemoteAddress() != null) {
            return request.getRemoteAddress()
                    .getAddress()
                    .getHostAddress();
        }

        return "unknown";
    }
}
