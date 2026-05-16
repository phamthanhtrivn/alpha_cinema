package com.movieticket.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-services")
public record AiServiceProperties(
        ServiceEndpoint movieService,
        ServiceEndpoint cinemaService,
        ServiceEndpoint userService,
        ServiceEndpoint orderService,
        ServiceEndpoint ticketService
) {
    public String movieServiceUrl() {
        return requiredBaseUrl(movieService, "external-services.movie-service.base-url");
    }

    public String cinemaServiceUrl() {
        return requiredBaseUrl(cinemaService, "external-services.cinema-service.base-url");
    }

    public String userServiceUrl() {
        return requiredBaseUrl(userService, "external-services.user-service.base-url");
    }

    public String orderServiceUrl() {
        return requiredBaseUrl(orderService, "external-services.order-service.base-url");
    }

    public String ticketServiceUrl() {
        return requiredBaseUrl(ticketService, "external-services.ticket-service.base-url");
    }

    private static String requiredBaseUrl(ServiceEndpoint endpoint, String propertyName) {
        if (endpoint == null || endpoint.baseUrl() == null || endpoint.baseUrl().isBlank()) {
            throw new IllegalStateException("Missing required configuration: " + propertyName);
        }
        return endpoint.baseUrl();
    }

    public record ServiceEndpoint(String baseUrl) {
    }
}
