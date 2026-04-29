package com.movieticket.gateway.filter;

import com.movieticket.gateway.config.RouteValidator;
import com.movieticket.gateway.utils.IpUtils;
import com.movieticket.gateway.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.lang.annotation.Annotation;
import java.util.List;

@Component
public class AuthenticationFilter implements GlobalFilter, Order {
    @Autowired
    private RouteValidator routeValidator;
    @Autowired
    private JwtUtils jwtUtils;

    public static final List<String> CustomerEndpoints = List.of(
            "users/auth/register",
            "users/auth/login"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        if(routeValidator.isSecured.test(request)){
            if(!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)){
                return this.onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }
        }
        else {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
        String token = "";
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            return this.onError(exchange, "Invalid authorization header format", HttpStatus.UNAUTHORIZED);
        }

        try{
            String path = request.getURI().getPath();

            boolean expire = jwtUtils.isTokenExpired(token);

            if (expire) {
                return this.onError(exchange, "Token hết hạn", HttpStatus.FORBIDDEN);
            }

            String role = jwtUtils.extractRole(token);

//            if (AdminEndpoints.contains(path) && !"ADMIN".equals(role)) {
//                return this.onError(exchange, "Yêu cầu quyền ADMIN", HttpStatus.FORBIDDEN);
//            }
//            if (CustomerEndpoints.contains(path) && !"CUSTOMER".equals(role)) {
//                return this.onError(exchange, "Yêu cầu quyền CUSTOMER", HttpStatus.FORBIDDEN);
//            }
//            if (EmployeeEndpoints.contains(path) && !"EMPLOYEE".equals(role)) {
//                return this.onError(exchange, "Yêu cầu quyền EMPLOYEE", HttpStatus.FORBIDDEN);
//            }

            String userId = jwtUtils.extractUserId(token);
            String clientIp = IpUtils.resolveClientIp(request);

            ServerHttpRequest mutatedRequest = request.mutate()
                    .headers(headers -> {
                        headers.remove("X-User-Id");
                        headers.remove("X-User-IP");
                        headers.add("X-User-Id", userId);
                        headers.add("X-User-IP", clientIp);
                    })
                    .build();

            ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();

            return chain.filter(mutatedExchange);
        } catch (Exception e) {
            return this.onError(exchange, "Token is invalid or expired", HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String errMessage, HttpStatus httpStatus) {
        System.out.println("Gateway Security Error: " + errMessage);
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int value() {
        return 0;
    }

    @Override
    public Class<? extends Annotation> annotationType() {
        return null;
    }
}
