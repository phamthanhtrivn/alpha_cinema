package com.movieticket.order.service;

import com.movieticket.order.dto.client.CinemaLookupResponse;
import com.movieticket.order.dto.client.CinemaSnapshot;
import com.movieticket.order.dto.client.CustomerInformation;
import com.movieticket.order.dto.client.PaymentInitiateLookupResponse;
import com.movieticket.order.dto.client.PaymentInitiateRequest;
import com.movieticket.order.dto.client.PaymentInitiateSnapshot;
import com.movieticket.order.dto.client.ProductBatchLookupResponse;
import com.movieticket.order.dto.client.ProductSnapshot;
import com.movieticket.order.dto.client.RoomLookupResponse;
import com.movieticket.order.dto.client.RoomSnapshot;
import com.movieticket.order.dto.client.SeatBatchLookupResponse;
import com.movieticket.order.dto.client.SeatSnapshot;
import com.movieticket.order.dto.client.ShowScheduleBatchLookupResponse;
import com.movieticket.order.dto.client.ShowScheduleLookupResponse;
import com.movieticket.order.dto.client.ShowScheduleSnapshot;
import com.movieticket.order.dto.client.TicketPriceBatchLookupResponse;
import com.movieticket.order.dto.client.TicketPriceSnapshot;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.model.cache.ProductCache;
import com.movieticket.order.model.cache.TicketPriceCache;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutPartnerGateway {
    private static final int PAYMENT_INIT_RETRY_COUNT = 8;
    private static final long PAYMENT_INIT_RETRY_DELAY_MS = 250L;

    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate;
    private final WebClient.Builder webClientBuilder;

    @Value("${external-services.product-service.base-url}")
    private String productServiceBaseUrl;

    @Value("${external-services.user-service.base-url}")
    private String userServiceBaseUrl;

    @Value("${external-services.ticket-service.base-url}")
    private String ticketServiceBaseUrl;

    @Value("${external-services.payment-service.base-url}")
    private String paymentServiceBaseUrl;

    @Value("${external-services.cinema-service.base-url}")
    private String cinemaServiceBaseUrl;

    public record CreateSessionSnapshot(
            CustomerInformation customer,
            ShowScheduleSnapshot showSchedule,
            RoomSnapshot room,
            CinemaSnapshot cinema
    ) {
    }

    @CircuitBreaker(name = "userService")
    @Retry(name = "userService", fallbackMethod = "getCustomerInformationFallback")
    public CustomerInformation getCustomerInformation(String customerId) {
        return webClientBuilder.build()
                .get()
                .uri(userServiceBaseUrl + "/api/customers/{id}/info", customerId)
                .retrieve()
                .bodyToMono(CustomerInformation.class)
                .map(customer -> {
                    if (customer == null || !customer.isStatus()) {
                        throw new BusinessException("Customer is unavailable for id: " + customerId);
                    }
                    return customer;
                })
                .block();
    }

    public CustomerInformation getCustomerInformationFallback(String customerId, Throwable throwable) {
        throw new BusinessException("Dịch vụ thông tin khách hàng tạm thời không khả dụng. Vui lòng thử lại sau.");
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "getShowScheduleSnapshotsFallback")
    @Retry(name = "productService")
    public Map<String, ShowScheduleSnapshot> getShowScheduleSnapshots(List<String> showScheduleIds) {
        List<String> normalizedIds = normalizeDistinctIds(showScheduleIds);
        if (normalizedIds.isEmpty()) {
            return Map.of();
        }

        try {
            ShowScheduleBatchLookupResponse response = restTemplate.postForObject(
                    productServiceBaseUrl + "/api/show-schedules/batch",
                    normalizedIds,
                    ShowScheduleBatchLookupResponse.class
            );

            List<ShowScheduleSnapshot> showSchedules = response == null ? null : response.getData();
            if (showSchedules == null) {
                throw new BusinessException("Unable to resolve show schedule information for checkout");
            }

            Map<String, ShowScheduleSnapshot> showSchedulesById = showSchedules.stream()
                    .collect(Collectors.toMap(ShowScheduleSnapshot::getId, Function.identity(), (first, second) -> first));

            Map<String, ShowScheduleSnapshot> orderedShowSchedules = new LinkedHashMap<>();
            for (String id : normalizedIds) {
                ShowScheduleSnapshot showSchedule = showSchedulesById.get(id);
                if (showSchedule != null) {
                    orderedShowSchedules.put(id, showSchedule);
                }
            }

            return orderedShowSchedules;
        } catch (RestClientException ex) {
            ex.printStackTrace();
            throw new BusinessException("Error: Unable to resolve show schedule information for checkout");
        }
    }

    public Map<String, ShowScheduleSnapshot> getShowScheduleSnapshotsFallback(List<String> showScheduleIds, Throwable throwable) {
        throw new BusinessException("Dịch vụ lịch chiếu phim tạm thời không khả dụng. Vui lòng thử lại sau.");
    }

    @CircuitBreaker(name = "cinemaService")
    @Retry(name = "cinemaService", fallbackMethod = "getRoomSnapshotFallback")
    public RoomSnapshot getRoomSnapshot(String roomId) {
        return webClientBuilder.build()
                .get()
                .uri(cinemaServiceBaseUrl + "/api/rooms/{id}", roomId)
                .retrieve()
                .bodyToMono(RoomLookupResponse.class)
                .map(res -> res == null ? null : res.getData())
                .map(room -> {
                    if (room == null) {
                        throw new BusinessException("Room not found");
                    }
                    return room;
                })
                .block();
    }

    public RoomSnapshot getRoomSnapshotFallback(String roomId, Throwable throwable) {
        throw new BusinessException("Dịch vụ phòng chiếu tạm thời không khả dụng. Vui lòng thử lại sau.");
    }

    @CircuitBreaker(name = "cinemaService")
    @Retry(name = "cinemaService", fallbackMethod = "getCinemaSnapshotFallback")
    public CinemaSnapshot getCinemaSnapshot(String cinemaId) {
        return webClientBuilder.build()
                .get()
                .uri(cinemaServiceBaseUrl + "/api/cinemas/{id}", cinemaId)
                .retrieve()
                .bodyToMono(CinemaLookupResponse.class)
                .map(res -> res == null ? null : res.getData())
                .map(cinema -> {
                    if (cinema == null || !cinema.isStatus()) {
                        throw new BusinessException("Cinema not valid");
                    }
                    return cinema;
                })
                .block();
    }

    public CinemaSnapshot getCinemaSnapshotFallback(String cinemaId, Throwable throwable) {
        throw new BusinessException("Dịch vụ rạp phim tạm thời không khả dụng. Vui lòng thử lại sau.");
    }

    public CreateSessionSnapshot getCreateSessionSnapshot(String customerId, String showScheduleId) {
        WebClient webClient = webClientBuilder.build();

        Mono<CustomerInformation> customerMono = webClient.get()
                .uri(userServiceBaseUrl + "/api/customers/{id}/info", customerId)
                .retrieve()
                .bodyToMono(CustomerInformation.class)
                .map(customer -> {
                    if (customer == null || !customer.isStatus()) {
                        throw new BusinessException("Customer is unavailable for id: " + customerId);
                    }
                    return customer;
                });

        Mono<ShowScheduleSnapshot> showMono = webClient.get()
                .uri(productServiceBaseUrl + "/api/show-schedules/{id}", showScheduleId)
                .retrieve()
                .bodyToMono(ShowScheduleLookupResponse.class)
                .map(res -> res == null ? null : res.getData())
                .map(show -> {
                    if (show == null) {
                        throw new BusinessException("Show schedule not found");
                    }
                    return show;
                });

        Mono<RoomSnapshot> roomMono = showMono.flatMap(show ->
                webClient.get()
                        .uri(cinemaServiceBaseUrl + "/api/rooms/{id}", show.getRoomId())
                        .retrieve()
                        .bodyToMono(RoomLookupResponse.class)
                        .map(res -> res == null ? null : res.getData())
                        .map(room -> {
                            if (room == null) throw new BusinessException("Room not found");
                            return room;
                        })
        );

        Mono<CinemaSnapshot> cinemaMono = showMono.flatMap(show ->
                webClient.get()
                        .uri(cinemaServiceBaseUrl + "/api/cinemas/{id}", show.getCinemaId())
                        .retrieve()
                        .bodyToMono(CinemaLookupResponse.class)
                        .map(res -> res == null ? null : res.getData())
                        .map(cinema -> {
                            if (cinema == null || !cinema.isStatus()) {
                                throw new BusinessException("Cinema not valid");
                            }
                            return cinema;
                        })
        );

        return Mono.zip(customerMono, showMono, roomMono, cinemaMono)
                .map(t -> new CreateSessionSnapshot(
                        t.getT1(), t.getT2(), t.getT3(), t.getT4()
                ))
                .block();
    }

    @CircuitBreaker(name = "productService")
    @Retry(name = "productService", fallbackMethod = "getProductsFallback")
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
                        .imageUrl(product.getPictureUrl())
                        .unitPrice(product.getUnitPrice())
                        .status(product.isStatus())
                        .stockQty(product.getStockQty())
                        .build());
            }
            return productCacheById;
        } catch (RestClientException ex) {
            throw new BusinessException("Unable to resolve product information for checkout");
        }
    }

    public Map<String, ProductCache> getProductsFallback(List<String> productIds, Throwable throwable) {
        throw new BusinessException("Dịch vụ sản phẩm/bắp nước tạm thời không khả dụng. Vui lòng thử lại sau.");
    }

    @CircuitBreaker(name = "ticketService")
    @Retry(name = "ticketService", fallbackMethod = "getTicketPricesFallback")
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

    public Map<String, TicketPriceCache> getTicketPricesFallback(List<String> ticketPriceIds, Throwable throwable) {
        throw new BusinessException("Dịch vụ giá vé tạm thời không khả dụng. Vui lòng thử lại sau.");
    }

    @CircuitBreaker(name = "cinemaService")
    @Retry(name = "cinemaService", fallbackMethod = "getSeatsByIdsFallback")
    public Map<String, SeatSnapshot> getSeatsByIds(List<String> seatIds) {
        List<String> normalizedIds = normalizeDistinctIds(seatIds);
        if (normalizedIds.isEmpty()) {
            return Map.of();
        }

        try {
            SeatBatchLookupResponse response = restTemplate.postForObject(
                    cinemaServiceBaseUrl + "/api/seats/batch",
                    normalizedIds,
                    SeatBatchLookupResponse.class
            );

            List<SeatSnapshot> seats = response == null ? null : response.getData();
            if (seats == null) {
                throw new BusinessException("Unable to resolve seat information for checkout");
            }

            Map<String, SeatSnapshot> seatsById = new HashMap<>();
            for (SeatSnapshot seat : seats) {
                seatsById.put(seat.getId(), seat);
            }
            return seatsById;
        } catch (RestClientException ex) {
            throw new BusinessException("Unable to resolve seat information for checkout");
        }
    }

    public Map<String, SeatSnapshot> getSeatsByIdsFallback(List<String> seatIds, Throwable throwable) {
        throw new BusinessException("Dịch vụ thông tin ghế tạm thời không khả dụng. Vui lòng thử lại sau.");
    }

    public PaymentInitiateSnapshot initiatePayment(String orderId, String paymentMethod, double amount, String bankCode, String userIp) {
        PaymentInitiateRequest request = PaymentInitiateRequest.builder()
                .method(paymentMethod)
                .amount(amount)
                .bankCode(bankCode)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (userIp != null && !userIp.isBlank()) {
            headers.set("X-FORWARDED-FOR", userIp.trim());
        }

        HttpEntity<PaymentInitiateRequest> entity = new HttpEntity<>(request, headers);

        for (int attempt = 1; attempt <= PAYMENT_INIT_RETRY_COUNT; attempt++) {
            try {
                PaymentInitiateLookupResponse response = restTemplate.postForObject(
                        paymentServiceBaseUrl + "/api/payments/orders/{orderId}/initiate",
                        entity,
                        PaymentInitiateLookupResponse.class,
                        orderId
                );

                PaymentInitiateSnapshot paymentData = response == null ? null : response.getData();
                if (paymentData != null && paymentData.getPaymentUrl() != null && !paymentData.getPaymentUrl().isBlank()) {
                    return paymentData;
                }
            } catch (RestClientException ex) {
                // Ignore transient failures while waiting for payment-event processing.
            }

            if (attempt < PAYMENT_INIT_RETRY_COUNT) {
                sleepBeforeRetry();
            }
        }

        throw new BusinessException("Không thể khởi tạo URL thanh toán. Vui lòng thử lại.");
    }

    private void sleepBeforeRetry() {
        try {
            Thread.sleep(PAYMENT_INIT_RETRY_DELAY_MS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Interrupted while initiating payment");
        }
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
