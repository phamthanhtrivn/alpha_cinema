package com.movieticket.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.movieticket.ai.config.AiToolProperties;
import com.movieticket.ai.dto.tool.ProductToolResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Locale;

@Component
@Slf4j
@CircuitBreaker(name = "movieService")
@Retry(name = "movieService")
public class ProductServiceClient {
    private static final int MAX_PRODUCTS = 12;

    private final WebClient productWebClient;
    private final Duration timeout;

    public ProductServiceClient(
            @Qualifier("movieWebClient") WebClient productWebClient,
            AiToolProperties toolProperties
    ) {
        this.productWebClient = productWebClient;
        this.timeout = Duration.ofMillis(toolProperties.safeTimeoutMs());
    }

    public List<ProductToolResponse> getProducts(String productName, String productType, Integer limit) {
        ApiEnvelope<List<ProductApiResponse>> response = call(
                productWebClient.get()
                        .uri("/api/products/all")
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<ProductApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        int effectiveLimit = safeLimit(limit);
        return response.data().stream()
                .filter(product -> Boolean.TRUE.equals(product.status()))
                .filter(product -> matchesText(productName, product.name()))
                .filter(product -> matchesType(productType, product.type()))
                .limit(effectiveLimit)
                .map(product -> new ProductToolResponse(
                        product.id(),
                        product.name(),
                        product.unitPrice(),
                        product.description(),
                        product.type(),
                        product.pictureUrl()
                ))
                .toList();
    }

    private boolean matchesText(String expected, String actual) {
        if (!StringUtils.hasText(expected)) {
            return true;
        }
        return actual != null && normalize(actual).contains(normalize(expected));
    }

    private boolean matchesType(String expected, String actual) {
        if (!StringUtils.hasText(expected)) {
            return true;
        }
        return actual != null && normalize(actual).equals(normalize(expected));
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private int safeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return MAX_PRODUCTS;
        }
        return Math.min(limit, MAX_PRODUCTS);
    }

    private <T> T call(reactor.core.publisher.Mono<T> mono) {
        try {
            return mono.timeout(timeout).block(timeout.plusMillis(500));
        } catch (Exception ex) {
            log.warn("AI tool getProducts failed calling product-service: {}", ex.getMessage());
            return null;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ProductApiResponse(
            String id,
            String name,
            Double unitPrice,
            String pictureUrl,
            String description,
            String type,
            Boolean status
    ) {
    }
}
