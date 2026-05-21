package com.movieticket.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.movieticket.ai.config.AiToolProperties;
import com.movieticket.ai.dto.tool.TicketPriceToolResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class TicketServiceClient {
    private static final int MAX_TICKET_PRICES = 20;

    private final WebClient ticketWebClient;
    private final CinemaServiceClient cinemaServiceClient;
    private final Duration timeout;

    public TicketServiceClient(
            @Qualifier("ticketWebClient") WebClient ticketWebClient,
            CinemaServiceClient cinemaServiceClient,
            AiToolProperties toolProperties
    ) {
        this.ticketWebClient = ticketWebClient;
        this.cinemaServiceClient = cinemaServiceClient;
        this.timeout = Duration.ofMillis(toolProperties.safeTimeoutMs());
    }

    public List<TicketPriceToolResponse> getTicketPrices(String seatTypeName, String projectionType, String dayType) {
        List<SeatTypeApiResponse> seatTypes = cinemaServiceClient.getSeatTypes();
        Map<String, SeatTypeApiResponse> seatTypeById = seatTypes.stream()
                .collect(Collectors.toMap(SeatTypeApiResponse::id, Function.identity(), (left, right) -> left));
        List<String> seatTypeIds = resolveSeatTypeIds(seatTypeName, seatTypes);

        if (StringUtils.hasText(seatTypeName) && seatTypeIds.isEmpty()) {
            return List.of();
        }

        if (seatTypeIds.isEmpty()) {
            return searchTicketPrices(null, projectionType, dayType, seatTypeById);
        }

        return seatTypeIds.stream()
                .flatMap(seatTypeId -> searchTicketPrices(seatTypeId, projectionType, dayType, seatTypeById).stream())
                .limit(MAX_TICKET_PRICES)
                .toList();
    }

    public TicketPriceToolResponse determineTicketPrice(String seatTypeId, String projectionType, String showTime) {
        if (!StringUtils.hasText(seatTypeId) || !StringUtils.hasText(showTime)) {
            return null;
        }

        ApiEnvelope<TicketPriceApiResponse> response = call(
                "determineTicketPrice",
                "seatTypeId=" + safeForLog(seatTypeId) + ", projectionType=" + safeForLog(projectionType),
                ticketWebClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path("/api/tickets/determine-ticket-price")
                                    .queryParam("seatTypeId", seatTypeId)
                                    .queryParam("showTime", showTime);
                            if (StringUtils.hasText(projectionType)) {
                                builder.queryParam("projectionType", normalizeProjectionType(projectionType));
                            }
                            return builder.build();
                        })
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<TicketPriceApiResponse>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return null;
        }

        return toToolResponse(response.data(), null);
    }

    public List<TicketPriceToolResponse> determineTicketPrices(String seatTypeName, String projectionType, String showTime) {
        if (!StringUtils.hasText(seatTypeName) || !StringUtils.hasText(showTime)) {
            return List.of();
        }

        List<SeatTypeApiResponse> seatTypes = cinemaServiceClient.getSeatTypes();
        Map<String, SeatTypeApiResponse> seatTypeById = seatTypes.stream()
                .collect(Collectors.toMap(SeatTypeApiResponse::id, Function.identity(), (left, right) -> left));
        List<String> seatTypeIds = resolveSeatTypeIds(seatTypeName, seatTypes);

        if (seatTypeIds.isEmpty()) {
            return List.of();
        }

        return seatTypeIds.stream()
                .flatMap(seatTypeId -> determineTicketPricesBySeatTypeId(
                        seatTypeId,
                        projectionType,
                        showTime,
                        seatTypeById
                ).stream())
                .limit(MAX_TICKET_PRICES)
                .toList();
    }

    public List<TicketPriceToolResponse> getShowtimeTicketPrices(String projectionType, String showTime) {
        if (!StringUtils.hasText(showTime)) {
            return List.of();
        }

        List<SeatTypeApiResponse> seatTypes = cinemaServiceClient.getSeatTypes();
        Map<String, SeatTypeApiResponse> seatTypeById = seatTypes.stream()
                .collect(Collectors.toMap(SeatTypeApiResponse::id, Function.identity(), (left, right) -> left));

        ApiEnvelope<List<TicketPriceApiResponse>> response = call(
                "getShowtimeTicketPrices",
                "projectionType=" + safeForLog(projectionType) + ", showTime=" + safeForLog(showTime),
                ticketWebClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path("/api/tickets/showtime-prices")
                                    .queryParam("showTime", showTime);
                            if (StringUtils.hasText(projectionType)) {
                                builder.queryParam("projectionType", normalizeProjectionType(projectionType));
                            }
                            return builder.build();
                        })
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<TicketPriceApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        return response.data().stream()
                .map(ticketPrice -> toToolResponse(ticketPrice, seatTypeById.get(ticketPrice.seatTypeId())))
                .limit(MAX_TICKET_PRICES)
                .toList();
    }

    private List<TicketPriceToolResponse> determineTicketPricesBySeatTypeId(
            String seatTypeId,
            String projectionType,
            String showTime,
            Map<String, SeatTypeApiResponse> seatTypeById
    ) {
        ApiEnvelope<List<TicketPriceApiResponse>> response = call(
                "determineTicketPrices",
                "seatTypeId=" + safeForLog(seatTypeId) + ", projectionType=" + safeForLog(projectionType),
                ticketWebClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path("/api/tickets/determine-ticket-prices")
                                    .queryParam("seatTypeId", seatTypeId)
                                    .queryParam("showTime", showTime);
                            if (StringUtils.hasText(projectionType)) {
                                builder.queryParam("projectionType", normalizeProjectionType(projectionType));
                            }
                            return builder.build();
                        })
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<TicketPriceApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        return response.data().stream()
                .map(ticketPrice -> toToolResponse(ticketPrice, seatTypeById.get(ticketPrice.seatTypeId())))
                .toList();
    }

    private List<TicketPriceToolResponse> searchTicketPrices(
            String seatTypeId,
            String projectionType,
            String dayType,
            Map<String, SeatTypeApiResponse> seatTypeById
    ) {
        ApiEnvelope<PageEnvelope<TicketPriceApiResponse>> response = call(
                "getTicketPrices",
                "seatTypeId=" + safeForLog(seatTypeId)
                        + ", projectionType=" + safeForLog(projectionType)
                        + ", dayType=" + safeForLog(dayType),
                ticketWebClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path("/api/tickets")
                                    .queryParam("page", 0)
                                    .queryParam("size", MAX_TICKET_PRICES)
                                    .queryParam("status", true);
                            if (StringUtils.hasText(seatTypeId)) {
                                builder.queryParam("seatTypeId", seatTypeId);
                            }
                            if (StringUtils.hasText(projectionType)) {
                                builder.queryParam("projectionType", normalizeProjectionType(projectionType));
                            }
                            if (StringUtils.hasText(dayType)) {
                                builder.queryParam("dayType", normalizeDayType(dayType));
                            }
                            return builder.build();
                        })
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<PageEnvelope<TicketPriceApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null || response.data().content() == null) {
            return List.of();
        }

        return response.data().content().stream()
                .map(ticketPrice -> toToolResponse(ticketPrice, seatTypeById.get(ticketPrice.seatTypeId())))
                .toList();
    }

    private List<String> resolveSeatTypeIds(String seatTypeName, List<SeatTypeApiResponse> seatTypes) {
        if (!StringUtils.hasText(seatTypeName)) {
            return List.of();
        }

        String normalizedName = normalizeSearchText(seatTypeName);
        List<String> exactMatches = seatTypes.stream()
                .filter(seatType -> normalizeSearchText(seatType.name()).equals(normalizedName))
                .map(SeatTypeApiResponse::id)
                .toList();

        if (!exactMatches.isEmpty()) {
            return exactMatches;
        }

        return seatTypes.stream()
                .filter(seatType -> normalizeSearchText(seatType.name()).contains(normalizedName))
                .map(SeatTypeApiResponse::id)
                .toList();
    }

    private String normalizeSearchText(String value) {
        if (value == null) {
            return "";
        }
        String withoutAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutAccents
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }

    private TicketPriceToolResponse toToolResponse(TicketPriceApiResponse ticketPrice, SeatTypeApiResponse seatType) {
        return new TicketPriceToolResponse(
                ticketPrice.id(),
                ticketPrice.seatTypeId(),
                seatType == null ? null : seatType.name(),
                ticketPrice.projectionType(),
                ticketPrice.dayType(),
                ticketPrice.price() == null ? null : BigDecimal.valueOf(ticketPrice.price()),
                ticketPrice.status()
        );
    }

    private String normalizeProjectionType(String projectionType) {
        String normalized = projectionType.trim().toUpperCase();
        if ("2D".equals(normalized)) {
            return "_2D";
        }
        if ("3D".equals(normalized)) {
            return "_3D";
        }
        return normalized;
    }

    private String normalizeDayType(String dayType) {
        String normalized = dayType.trim().toUpperCase();
        return switch (normalized) {
            case "MONDAY_TO_FRIDAY", "WEEK_DAY", "THU_2_DEN_THU_6", "T2_T6", "NGAY_THUONG" -> "WEEKDAY";
            case "WEEKEND_BEFORE17", "WEEKEND_BEFORE_17H", "WEEKEND_TRUOC_17H", "CUOI_TUAN_TRUOC_17H" -> "WEEKEND_BEFORE_17";
            case "WEEKEND_AFTER17", "WEEKEND_AFTER_17H", "WEEKEND_SAU_17H", "CUOI_TUAN_SAU_17H" -> "WEEKEND_AFTER_17";
            case "LE", "TET", "NGAY_LE", "HOLIDAYS" -> "HOLIDAY";
            default -> normalized;
        };
    }

    private String safeForLog(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }

    private <T> T call(String toolName, String params, reactor.core.publisher.Mono<T> mono) {
        try {
            return mono.timeout(timeout).block(timeout.plusMillis(500));
        } catch (Exception ex) {
            log.warn("AI tool {} failed calling ticket-service with params [{}]: {}", toolName, params, ex.getMessage());
            return null;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SeatTypeApiResponse(
            String id,
            String name,
            String description
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record TicketPriceApiResponse(
            String id,
            String seatTypeId,
            String projectionType,
            String dayType,
            Double price,
            Boolean status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }
}
