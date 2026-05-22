package com.movieticket.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.movieticket.ai.config.AiToolProperties;
import com.movieticket.ai.dto.tool.CustomerMembershipToolResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

import java.time.Duration;

@Component
@Slf4j
@CircuitBreaker(name = "userService")
@Retry(name = "userService")
public class UserServiceClient {
    private final WebClient userWebClient;
    private final Duration timeout;

    public UserServiceClient(
            @Qualifier("userWebClient") WebClient userWebClient,
            AiToolProperties toolProperties
    ) {
        this.userWebClient = userWebClient;
        this.timeout = Duration.ofMillis(toolProperties.safeTimeoutMs());
    }

    public CustomerMembershipToolResponse getCustomerMembership(String customerId) {
        if (!StringUtils.hasText(customerId)) {
            return null;
        }

        ApiEnvelope<CustomerProfileApiResponse> response = call(
                "getCustomerMembership",
                userWebClient.get()
                        .uri("/api/customers/profile")
                        .header("X-User-Id", customerId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<CustomerProfileApiResponse>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return null;
        }

        CustomerProfileApiResponse customer = response.data();
        return new CustomerMembershipToolResponse(
                customerId,
                customer.fullName(),
                customer.loyaltyPoint(),
                customer.customerType(),
                null
        );
    }

    private <T> T call(String toolName, reactor.core.publisher.Mono<T> mono) {
        try {
            return mono.timeout(timeout).block(timeout.plusMillis(500));
        } catch (Exception ex) {
            log.warn("AI tool {} failed calling user-service: {}", toolName, ex.getMessage());
            return null;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CustomerProfileApiResponse(
            String fullName,
            String customerType,
            Integer loyaltyPoint
    ) {
    }
}
