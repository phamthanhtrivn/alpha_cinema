package com.movieticket.gateway.config;

import com.movieticket.gateway.utils.IpUtils;
import com.movieticket.gateway.utils.JwtUtils;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    private static final String BEARER_PREFIX = "Bearer ";

    @Bean
    public KeyResolver userOrIpKeyResolver(JwtUtils jwtUtils) {
        return exchange -> {
            ServerHttpRequest request = exchange.getRequest();
            String userId = resolveUserId(request, jwtUtils);

            if (userId != null && !userId.isBlank()) {
                return Mono.just("user:" + userId);
            }

            return Mono.just("ip:" + IpUtils.resolveClientIp(request));
        };
    }

    private String resolveUserId(ServerHttpRequest request, JwtUtils jwtUtils) {
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }

        try {
            return jwtUtils.extractUserId(authHeader.substring(BEARER_PREFIX.length()));
        } catch (Exception ignored) {
            return null;
        }
    }
}
