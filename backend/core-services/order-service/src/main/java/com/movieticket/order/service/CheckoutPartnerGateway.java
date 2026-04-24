package com.movieticket.order.service;

import com.movieticket.order.dto.client.CustomerLookupResponse;
import com.movieticket.order.dto.client.CustomerSnapshot;
import com.movieticket.order.dto.client.ProductBatchLookupResponse;
import com.movieticket.order.dto.client.ProductLookupResponse;
import com.movieticket.order.dto.client.ProductSnapshot;
import com.movieticket.order.dto.client.TicketPriceBatchLookupResponse;
import com.movieticket.order.dto.client.TicketPriceLookupResponse;
import com.movieticket.order.dto.client.TicketPriceSnapshot;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.model.cache.CustomerLoyaltyCache;
import com.movieticket.order.model.cache.ProductCache;
import com.movieticket.order.model.cache.TicketPriceCache;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutPartnerGateway {
    private static final long CUSTOMER_CACHE_MINUTES = 10L;

    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate;

    @Value("${external-services.product-service.base-url}")
    private String productServiceBaseUrl;

    @Value("${external-services.user-service.base-url}")
    private String userServiceBaseUrl;

    @Value("${external-services.ticket-service.base-url}")
    private String ticketServiceBaseUrl;

    public ProductCache getProduct(String productId) {
        return getProducts(List.of(productId)).get(productId);
    }

    public Map<String, ProductCache> getProducts(List<String> productIds) {
        List<String> normalizedIds = normalizeDistinctIds(productIds);
        if (normalizedIds.isEmpty()) {
            return Map.of();
        }

        try {
            ProductBatchLookupResponse response = restTemplate.postForObject(
                    productServiceBaseUrl + "/api/products/batch",
                    normalizedIds,
                    ProductBatchLookupResponse.class
            );

            List<ProductSnapshot> products = response == null ? null : response.getData();
            if (products == null) {
                throw new BusinessException("Unable to resolve product information for checkout");
            }

            Map<String, ProductSnapshot> productsById = products.stream()
                    .collect(Collectors.toMap(ProductSnapshot::getId, Function.identity(), (first, second) -> first));

            Map<String, ProductCache> productCacheById = new LinkedHashMap<>();
            for (String id : normalizedIds) {
                ProductSnapshot product = productsById.get(id);
                if (product == null || !product.isStatus()) {
                    throw new BusinessException("Product is unavailable for id: " + id);
                }

                productCacheById.put(id, ProductCache.builder()
                        .productId(product.getId())
                        .name(product.getName())
                        .unitPrice(product.getUnitPrice())
                        .status(product.isStatus())
                        .build());
            }
            return productCacheById;
        } catch (RestClientException ex) {
            throw new BusinessException("Unable to resolve product information for checkout");
        }
    }

    public TicketPriceCache getTicketPrice(String ticketPriceId) {
        return getTicketPrices(List.of(ticketPriceId)).get(ticketPriceId);
    }

    public Map<String, TicketPriceCache> getTicketPrices(List<String> ticketPriceIds) {
        List<String> normalizedIds = normalizeDistinctIds(ticketPriceIds);
        if (normalizedIds.isEmpty()) {
            return Map.of();
        }

        try {
            TicketPriceBatchLookupResponse response = restTemplate.postForObject(
                    ticketServiceBaseUrl + "/api/tickets/batch",
                    normalizedIds,
                    TicketPriceBatchLookupResponse.class
            );

            List<TicketPriceSnapshot> ticketPrices = response == null ? null : response.getData();
            if (ticketPrices == null) {
                throw new BusinessException("Unable to resolve ticket price information for checkout");
            }

            Map<String, TicketPriceSnapshot> ticketPricesById = ticketPrices.stream()
                    .collect(Collectors.toMap(TicketPriceSnapshot::getId, Function.identity(), (first, second) -> first));

            Map<String, TicketPriceCache> ticketPriceCacheById = new LinkedHashMap<>();
            for (String id : normalizedIds) {
                TicketPriceSnapshot ticketPrice = ticketPricesById.get(id);
                if (ticketPrice == null || !ticketPrice.isStatus()) {
                    throw new BusinessException("Ticket price is unavailable for id: " + id);
                }

                ticketPriceCacheById.put(id, new TicketPriceCache(
                        ticketPrice.getId(),
                        ticketPrice.getPrice(),
                        ticketPrice.getSeatTypeId(),
                        ticketPrice.getProjectionType(),
                        ticketPrice.getDayType(),
                        ticketPrice.isStatus()
                ));
            }

            return ticketPriceCacheById;
        } catch (RestClientException ex) {
            throw new BusinessException("Unable to resolve ticket price information for checkout");
        }
    }

    public CustomerLoyaltyCache getCustomer(String customerId) {
        return getCustomer(customerId, false);
    }

    public CustomerLoyaltyCache refreshCustomer(String customerId) {
        return getCustomer(customerId, true);
    }

    private CustomerLoyaltyCache getCustomer(String customerId, boolean forceRefresh) {
        if (!forceRefresh) {
            Object cached = redisTemplate.opsForValue().get(buildCustomerKey(customerId));
            if (cached instanceof CustomerLoyaltyCache customerCache && customerCache.isStatus()) {
                return customerCache;
            }
        }

        return fetchCustomer(customerId);
    }

    private CustomerLoyaltyCache fetchCustomer(String customerId) {
        try {
            CustomerLookupResponse response = restTemplate.getForObject(
                    userServiceBaseUrl + "/api/customers/{id}",
                    CustomerLookupResponse.class,
                    customerId
            );

            CustomerSnapshot customer = response == null ? null : response.getData();
            if (customer == null || !customer.isStatus()) {
                throw new BusinessException("Customer is unavailable for id: " + customerId);
            }

            CustomerLoyaltyCache customerCache = CustomerLoyaltyCache.builder()
                    .customerId(customer.getId())
                    .loyaltyPoint(customer.getLoyaltyPoint())
                    .status(customer.isStatus())
                    .build();

            redisTemplate.opsForValue().set(buildCustomerKey(customerId), customerCache, CUSTOMER_CACHE_MINUTES, TimeUnit.MINUTES);
            return customerCache;
        } catch (RestClientException ex) {
            throw new BusinessException("Unable to resolve customer information for id: " + customerId);
        }
    }

    private String buildCustomerKey(String customerId) {
        return "customer:loyalty:" + customerId;
    }

    private List<String> normalizeDistinctIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        return ids.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .collect(Collectors.collectingAndThen(Collectors.toCollection(LinkedHashSet::new), List::copyOf));
    }
}
