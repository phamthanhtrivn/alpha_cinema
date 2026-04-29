package com.movieticket.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticket.order.dto.client.CinemaSnapshot;
import com.movieticket.order.dto.client.CustomerInformation;
import com.movieticket.order.dto.client.PaymentInitiateSnapshot;
import com.movieticket.order.dto.client.RoomSnapshot;
import com.movieticket.order.dto.client.SeatSnapshot;
import com.movieticket.order.dto.client.ShowScheduleSnapshot;
import com.movieticket.order.dto.request.CheckoutProductItemRequest;
import com.movieticket.order.dto.request.ConfirmCheckoutSessionRequest;
import com.movieticket.order.dto.request.CreateCheckoutSessionRequest;
import com.movieticket.order.dto.request.CreateShowScheduleDetailRequestDto;
import com.movieticket.order.dto.request.SeatRequestDto;
import com.movieticket.order.dto.request.UpdateCheckoutSessionRequest;
import com.movieticket.order.dto.response.CheckoutConfirmResponse;
import com.movieticket.order.dto.response.CheckoutProductItemResponse;
import com.movieticket.order.dto.response.CheckoutSessionResponse;
import com.movieticket.order.dto.response.SeatItemResponse;
import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderDetail;
import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.entity.Promotion;
import com.movieticket.order.entity.ShowScheduleDetail;
import com.movieticket.order.entity.ShowSeatType;
import com.movieticket.order.enums.SessionStatus;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.model.cache.CheckoutProductItemCache;
import com.movieticket.order.model.cache.CheckoutSessionCache;
import com.movieticket.order.model.cache.CustomerLoyaltyCache;
import com.movieticket.order.model.cache.ProductCache;
import com.movieticket.order.model.cache.PromotionCache;
import com.movieticket.order.model.cache.TicketPriceCache;
import com.movieticket.order.repository.OrderRepository;
import com.movieticket.order.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutSessionService {
    private static final long SESSION_TTL_MINUTES = 10L;
    private static final long ORDER_CACHE_TTL_HOURS = 24L;
    private static final int POINT_VALUE_VND = 1_000;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ShowScheduleDetailService showScheduleDetailService;
    private final OrderRepository orderRepository;
    private final PromotionRepository promotionRepository;
    private final CheckoutPartnerGateway checkoutPartnerGateway;
    private final PromotionCacheService promotionCacheService;
    private final TicketPriceCacheService ticketPriceCacheService;

    public CheckoutSessionResponse createSession(CreateCheckoutSessionRequest request) {
        String sessionId = UUID.randomUUID().toString();

        CheckoutPartnerGateway.CreateSessionSnapshot snapshot =
            checkoutPartnerGateway.getCreateSessionSnapshot(request.getCustomerId(), request.getShowScheduleId());
        CustomerInformation customer = snapshot.customer();
        ShowScheduleSnapshot showSchedule = snapshot.showSchedule();
        validateCinemaSelection(request.getCinemaId(), showSchedule.getCinemaId());

        RoomSnapshot room = snapshot.room();
        CinemaSnapshot cinema = snapshot.cinema();
        List<SeatRequestDto> resolvedSeats = resolveSeats(request.getSeats(), showSchedule.getRoomId());

        showScheduleDetailService.ensureSeatsNotBooked(showSchedule.getId(), resolvedSeats);
        showScheduleDetailService.lockSeats(sessionId, toSeatLockRequest(showSchedule.getId(), resolvedSeats));

        double seatSubtotal = resolvedSeats.stream()
                .map(SeatRequestDto::getFinalPrice)
                .mapToDouble(price -> price == null ? 0D : price)
                .sum();

        CheckoutSessionCache cache = CheckoutSessionCache.builder()
                .sessionId(sessionId)
                .cinemaId(cinema.getId())
                .cinemaName(cinema.getName())
                .cinemaAddress(cinema.getAddress())
                .roomId(room.getId())
                .roomNumber(room.getRoomNumber())
                .customerId(customer.getId())
                .customerName(customer.getFullName())
                .customerEmail(customer.getEmail())
                .showScheduleId(showSchedule.getId())
                .movieId(showSchedule.getMovieId())
                .movieTitle(showSchedule.getMovieTitle())
                .showStartTime(showSchedule.getStartTime())
                .showEndTime(showSchedule.getEndTime())
                .projectionType(showSchedule.getProjectionType())
                .translationType(showSchedule.getTranslationType())
                .seats(new ArrayList<>(resolvedSeats))
                .seatSubtotal(seatSubtotal)
                .productSubtotal(0D)
                .promotionDiscount(0D)
                .pointDiscount(0D)
                .pointsRedeemed(0)
                .availableLoyaltyPoints(customer.getLoyaltyPoint())
                .totalPayment(seatSubtotal)
                .expiresAt(LocalDateTime.now().plusMinutes(SESSION_TTL_MINUTES))
                .status(SessionStatus.SESSION_CREATED)
                .build();

        saveSession(cache);
        return toSessionResponse(cache);
    }

    public CheckoutSessionResponse updateSession(String sessionId, UpdateCheckoutSessionRequest request) {
        CheckoutSessionCache cache = getSession(sessionId);

        CustomerLoyaltyCache customer = CustomerLoyaltyCache.builder()
            .customerId(cache.getCustomerId())
            .loyaltyPoint(cache.getAvailableLoyaltyPoints())
            .status(true)
            .build();

        if (request.getItems() != null) {
            List<CheckoutProductItemCache> items = resolveProductItems(request.getItems());
            applyResolvedItems(cache, items);
        }

        String promotionCode = normalizePromotionCode(request.getPromotionCode());
        cache.setPromotionCode(promotionCode);

        int requestedPoints = resolveRequestedPoints(request);
        recalculateSessionTotals(cache, customer, requestedPoints);
        cache.setStatus(SessionStatus.SESSION_UPDATED);

        saveSession(cache);
        return toSessionResponse(cache);
    }

    @Transactional
    public CheckoutConfirmResponse confirmSession(String sessionId, ConfirmCheckoutSessionRequest request, String userIp) {
        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        String bankCode = normalizeBankCode(request.getBankCode(), paymentMethod);

        CheckoutSessionCache cache = getSession(sessionId);

        CreateShowScheduleDetailRequestDto seatValidationRequest = toSeatLockRequest(cache.getShowScheduleId(), cache.getSeats());

        showScheduleDetailService.validateSeatLocks(sessionId, seatValidationRequest);
        revalidateCheckoutValues(cache);

        Promotion promotion = null;
        if (cache.getPromotionCode() != null) {
            promotion = promotionCacheService.getPromotionEntity(cache.getPromotionCode());
            promotion.setRemainingQuantity(promotion.getRemainingQuantity() - 1);
            promotionRepository.save(promotion);
        }

        Order order = Order.builder()
                .qrCode("")
                .customerId(cache.getCustomerId())
                .employeeId(null)
                .cinemaId(cache.getCinemaId())
                .totalPrice(cache.getSeatSubtotal() + cache.getProductSubtotal())
                .pointDiscount(cache.getPointDiscount())
                .promotionDiscount(cache.getPromotionDiscount())
                .promotion(promotion)
                .totalPayment(cache.getTotalPayment())
                .status(OrderStatus.PENDING_PAYMENT)
                .build();

        List<OrderDetail> orderDetails = buildOrderDetails(order, cache.getItems());
        List<ShowScheduleDetail> showScheduleDetails = buildShowScheduleDetails(order, cache.getShowScheduleId(), cache.getSeats());

        order.setOrderDetails(orderDetails);
        order.setShowScheduleDetails(showScheduleDetails);

        Order savedOrder = orderRepository.save(order);

        cache.setOrderId(savedOrder.getId());
        cache.setStatus(SessionStatus.PAYMENT_PENDING);
        cache.setExpiresAt(LocalDateTime.now().plusHours(ORDER_CACHE_TTL_HOURS));
        saveSession(cache);

        PaymentInitiateSnapshot paymentSnapshot;
        try {
            paymentSnapshot = checkoutPartnerGateway.initiatePayment(
                    savedOrder.getId(),
                    paymentMethod,
                    savedOrder.getTotalPayment(),
                    bankCode,
                    userIp
            );
        } finally {
            showScheduleDetailService.releaseSeatLocks(sessionId, seatValidationRequest);
        }

        return CheckoutConfirmResponse.builder()
                .orderId(savedOrder.getId())
                .status(savedOrder.getStatus().name())
                .message("Đơn đặt hàng đã được tạo thành công. Bước tiếp theo là thanh toán.")
                .seats(toSeatItems(cache.getSeats()))
                .products(toProductItems(cache.getItems()))
                .paymentMethod(paymentSnapshot.getMethod())
                .paymentUrl(paymentSnapshot.getPaymentUrl())
                .totalPayment(savedOrder.getTotalPayment())
                .build();
    }

    public CheckoutSessionResponse getSessionDetail(String sessionId) {
        return toSessionResponse(getSession(sessionId));
    }

    public void cancelSession(String sessionId) {
        CheckoutSessionCache cache = getSession(sessionId);
        showScheduleDetailService.releaseSeatLocks(
                sessionId,
                toSeatLockRequest(cache.getShowScheduleId(), cache.getSeats())
        );
        deleteCheckoutCache(cache);
    }

    private List<OrderDetail> buildOrderDetails(Order order, List<CheckoutProductItemCache> items) {
        return items.stream()
                .map(item -> OrderDetail.builder()
                        .order(order)
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .price(item.getUnitPrice())
                        .subTotal(item.getSubtotal())
                        .build())
                .toList();
    }

    private List<ShowScheduleDetail> buildShowScheduleDetails(Order order, String showScheduleId, List<SeatRequestDto> seats) {
        return seats.stream()
                .map(seat -> ShowScheduleDetail.builder()
                        .order(order)
                        .showScheduleId(showScheduleId)
                        .seatId(seat.getSeatId())
                        .ticketPriceId(seat.getTicketPriceId())
                        .finalPrice(seat.getFinalPrice() == null ? 0D : seat.getFinalPrice())
                        .showSeatType(ShowSeatType.LOCKED)
                        .build())
                .toList();
    }

    private CheckoutProductItemCache toProductItemCache(CheckoutProductItemRequest request, Map<String, ProductCache> productsById) {
        ProductCache product = productsById.get(request.getProductId());
        if (product == null || !product.isStatus()) {
            throw new BusinessException("Sản phẩm không tồn tại: " + request.getProductId());
        }

        double subtotal = request.getQuantity() * product.getUnitPrice();
        return CheckoutProductItemCache.builder()
                .productId(request.getProductId())
                .productName(product.getName())
                .productImageUrl(product.getImageUrl())
                .quantity(request.getQuantity())
                .unitPrice(product.getUnitPrice())
                .subtotal(subtotal)
                .build();
    }

    private CreateShowScheduleDetailRequestDto toSeatLockRequest(String showScheduleId, List<SeatRequestDto> seats) {
        CreateShowScheduleDetailRequestDto dto = new CreateShowScheduleDetailRequestDto();
        dto.setShowScheduleId(showScheduleId);
        dto.setSeats(seats);
        return dto;
    }

    private String normalizePaymentMethod(String rawPaymentMethod) {
        if (rawPaymentMethod == null || rawPaymentMethod.isBlank()) {
            throw new BusinessException("Phương pháp thanh toán không được để trống");
        }

        String normalized = rawPaymentMethod.trim().toUpperCase();
        if (!"MOMO".equals(normalized) && !"VNPAY".equals(normalized)) {
            throw new BusinessException("Phương pháp thanh toán không được hỗ trợ: " + rawPaymentMethod);
        }
        return normalized;
    }

    private String normalizeBankCode(String bankCode, String paymentMethod) {
        if (!"VNPAY".equals(paymentMethod)) {
            return null;
        }

        if (bankCode == null || bankCode.isBlank()) {
            return null;
        }

        return bankCode.trim().toUpperCase();
    }

    private CheckoutSessionCache getSession(String sessionId) {
        Object cached = redisTemplate.opsForValue().get(buildSessionKey(sessionId));
        if (cached == null) {
            throw new BusinessException("Phiên thanh toán không tồn tại hoặc đã hết hạn");
        }

        CheckoutSessionCache sessionCache;
        boolean convertedFromMap = false;
        if (cached instanceof CheckoutSessionCache) {
            sessionCache = (CheckoutSessionCache) cached;
        } else if (cached instanceof Map<?, ?>) {
            try {
                sessionCache = objectMapper.convertValue(cached, CheckoutSessionCache.class);
                convertedFromMap = true;
            } catch (IllegalArgumentException ex) {
                throw new BusinessException("Dữ liệu phiên thanh toán không hợp lệ");
            }
        } else {
            throw new BusinessException("Dữ liệu phiên thanh toán không hợp lệ");
        }

        if (sessionCache.getExpiresAt() != null && !sessionCache.getExpiresAt().isAfter(LocalDateTime.now())) {
            deleteCheckoutCache(sessionCache);
            throw new BusinessException("Phiên thanh toán đã hết hạn");
        }

        if (convertedFromMap) {
            saveSession(sessionCache);
        }
        return sessionCache;
    }

    private void saveSession(CheckoutSessionCache cache) {
        long ttlSeconds = Duration.between(LocalDateTime.now(), cache.getExpiresAt()).getSeconds();
        if (ttlSeconds <= 0) {
            deleteCheckoutCache(cache);
            throw new BusinessException("Phiên thanh toán đã hết hạn");
        }

        redisTemplate.opsForValue().set(
                buildSessionKey(cache.getSessionId()),
                cache,
                ttlSeconds,
                TimeUnit.SECONDS
        );

        if (cache.getOrderId() != null && !cache.getOrderId().isBlank()) {
            redisTemplate.opsForValue().set(
                    buildOrderCacheKey(cache.getOrderId()),
                    cache,
                    ttlSeconds,
                    TimeUnit.SECONDS
            );
        }
    }

    private void deleteCheckoutCache(CheckoutSessionCache cache) {
        if (cache == null) {
            return;
        }

        if (cache.getSessionId() != null && !cache.getSessionId().isBlank()) {
            redisTemplate.delete(buildSessionKey(cache.getSessionId()));
        }
        if (cache.getOrderId() != null && !cache.getOrderId().isBlank()) {
            redisTemplate.delete(buildOrderCacheKey(cache.getOrderId()));
        }
    }

    private String buildSessionKey(String sessionId) {
        return "checkout:session:" + sessionId;
    }

    private String buildOrderCacheKey(String orderId) {
        return "checkout:session:order:" + orderId;
    }

    private double calculateTotalPayment(CheckoutSessionCache cache) {
        double total = cache.getSeatSubtotal() + cache.getProductSubtotal()
                - cache.getPromotionDiscount()
                - cache.getPointDiscount();
        return Math.max(total, 0D);
    }

    private List<SeatRequestDto> resolveSeats(List<SeatRequestDto> seats, String roomId) {
        if (seats == null || seats.isEmpty()) {
            return Collections.emptyList();
        }

        validateDistinctSeatSelection(seats);

        List<String> ticketPriceIds = collectDistinctIds(
                seats.stream().map(SeatRequestDto::getTicketPriceId).toList()
        );
        List<String> seatIds = collectDistinctIds(
                seats.stream().map(SeatRequestDto::getSeatId).toList()
        );
        Map<String, TicketPriceCache> ticketPricesById = ticketPriceCacheService.getTicketPrices(ticketPriceIds);
        Map<String, SeatSnapshot> seatsById = checkoutPartnerGateway.getSeatsByIds(seatIds);

        return seats.stream()
                .map(seat -> resolveSeatPrice(seat, roomId, ticketPricesById, seatsById))
                .toList();
    }

    private void validateDistinctSeatSelection(List<SeatRequestDto> seats) {
        List<String> seatIds = seats.stream()
                .map(SeatRequestDto::getSeatId)
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .toList();

        if (seatIds.size() != new LinkedHashSet<>(seatIds).size()) {
            throw new BusinessException("Danh sách ghế đang chọn bị trùng");
        }
    }

    private SeatRequestDto resolveSeatPrice(
            SeatRequestDto request,
            String roomId,
            Map<String, TicketPriceCache> ticketPricesById,
            Map<String, SeatSnapshot> seatsById
    ) {
        TicketPriceCache ticketPrice = ticketPricesById.get(request.getTicketPriceId());
        if (ticketPrice == null || ticketPrice.getPrice() == null || !ticketPrice.isStatus()) {
            throw new BusinessException("Giá vé không tồn tại: " + request.getTicketPriceId());
        }

        SeatSnapshot seatSnapshot = seatsById.get(request.getSeatId());
        if (seatSnapshot == null) {
            throw new BusinessException("Ghế không tồn tại: " + request.getSeatId());
        }
        if (!seatSnapshot.isStatus()) {
            throw new BusinessException("Ghế không còn khả dụng: " + request.getSeatId());
        }
        if (roomId != null && !roomId.equals(seatSnapshot.getRoomId())) {
            throw new BusinessException("Ghế không thuộc phòng của lịch chiếu: " + request.getSeatId());
        }
        if (ticketPrice.getSeatTypeId() != null
                && seatSnapshot.getSeatTypeId() != null
                && !ticketPrice.getSeatTypeId().equals(seatSnapshot.getSeatTypeId())) {
            throw new BusinessException("Giá vé không khớp loại ghế: " + request.getSeatId());
        }

        SeatRequestDto resolvedSeat = new SeatRequestDto();
        resolvedSeat.setSeatId(request.getSeatId());
        resolvedSeat.setTicketPriceId(request.getTicketPriceId());
        resolvedSeat.setFinalPrice(ticketPrice.getPrice());
        resolvedSeat.setRowName(seatSnapshot.getRowName());
        resolvedSeat.setColumnName(seatSnapshot.getColumnName());
        resolvedSeat.setSeatNumber(buildSeatNumber(seatSnapshot.getRowName(), seatSnapshot.getColumnName()));
        return resolvedSeat;
    }

    private List<CheckoutProductItemCache> resolveProductItems(List<CheckoutProductItemRequest> itemRequests) {
        if (itemRequests == null || itemRequests.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> productIds = collectDistinctIds(
                itemRequests.stream().map(CheckoutProductItemRequest::getProductId).toList()
        );
        Map<String, ProductCache> productsById = checkoutPartnerGateway.getProducts(productIds);

        return itemRequests.stream()
                .map(itemRequest -> toProductItemCache(itemRequest, productsById))
                .toList();
    }

    private List<CheckoutProductItemCache> refreshProductItems(List<CheckoutProductItemCache> cachedItems) {
        if (cachedItems == null || cachedItems.isEmpty()) {
            return Collections.emptyList();
        }

        return cachedItems.stream()
                .map(item -> {
                    CheckoutProductItemRequest request = new CheckoutProductItemRequest();
                    request.setProductId(item.getProductId());
                    request.setQuantity(item.getQuantity());
                    return request;
                })
                .collect(Collectors.collectingAndThen(Collectors.toList(), this::resolveProductItems));
    }

    private void applyResolvedItems(CheckoutSessionCache cache, List<CheckoutProductItemCache> items) {
        cache.setItems(new ArrayList<>(items));
        cache.setProductSubtotal(items.stream().mapToDouble(CheckoutProductItemCache::getSubtotal).sum());
    }

    private String normalizePromotionCode(String promotionCode) {
        if (promotionCode == null || promotionCode.isBlank()) {
            return null;
        }
        return promotionCode.trim().toUpperCase();
    }

    private double calculatePromotionDiscount(double amount, PromotionCache promotion) {
        if (promotion == null || amount <= 0D) {
            return 0D;
        }
        double discountAmount = Math.round((amount * promotion.getDiscount()) / 100.0D);
        return Math.min(discountAmount, amount);
    }

    private int resolveRequestedPoints(UpdateCheckoutSessionRequest request) {
        if (request.getPointsToRedeem() != null) {
            return request.getPointsToRedeem();
        }
        if (request.getPointDiscount() <= 0D) {
            return 0;
        }
        return (int) Math.floor(request.getPointDiscount() / POINT_VALUE_VND);
    }

    private int calculateApplicablePoints(int requestedPoints, int availablePoints, double payableBeforePoints) {
        if (requestedPoints <= 0 || availablePoints <= 0 || payableBeforePoints <= 0D) {
            return 0;
        }
        int maxByAmount = (int) Math.floor(payableBeforePoints / POINT_VALUE_VND);
        return Math.max(0, Math.min(requestedPoints, Math.min(availablePoints, maxByAmount)));
    }

    private void recalculateSessionTotals(CheckoutSessionCache cache, CustomerLoyaltyCache customer, int requestedPoints) {
        PromotionCache promotion = promotionCacheService.getPromotion(cache.getPromotionCode());
        double baseAmount = cache.getSeatSubtotal() + cache.getProductSubtotal();
        double promotionDiscount = calculatePromotionDiscount(baseAmount, promotion);
        int appliedPoints = calculateApplicablePoints(requestedPoints, customer.getLoyaltyPoint(), baseAmount - promotionDiscount);

        cache.setPromotionDiscount(promotionDiscount);
        cache.setPointsRedeemed(appliedPoints);
        cache.setPointDiscount(appliedPoints * POINT_VALUE_VND);
        cache.setTotalPayment(calculateTotalPayment(cache));
    }

    private void revalidateCheckoutValues(CheckoutSessionCache cache) {
        List<SeatRequestDto> refreshedSeats = resolveSeats(cache.getSeats(), cache.getRoomId());
        showScheduleDetailService.ensureSeatsNotBooked(cache.getShowScheduleId(), refreshedSeats);
        cache.setSeats(new ArrayList<>(refreshedSeats));
        cache.setSeatSubtotal(refreshedSeats.stream()
                .map(SeatRequestDto::getFinalPrice)
                .mapToDouble(price -> price == null ? 0D : price)
                .sum());

        applyResolvedItems(cache, refreshProductItems(cache.getItems()));

        CustomerLoyaltyCache customer = CustomerLoyaltyCache.builder()
            .customerId(cache.getCustomerId())
            .loyaltyPoint(cache.getAvailableLoyaltyPoints())
            .status(true)
            .build();
        int requestedPoints = cache.getPointsRedeemed();
        recalculateSessionTotals(cache, customer, requestedPoints);

        if (cache.getPointsRedeemed() < requestedPoints) {
            throw new BusinessException("Điểm khách hàng muốn sử dụng vượt quá mức có thể áp dụng cho đơn hàng này. Vui lòng điều chỉnh lại số điểm muốn sử dụng.");
        }
    }

    private List<String> collectDistinctIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }

        return ids.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .collect(Collectors.collectingAndThen(Collectors.toCollection(LinkedHashSet::new), List::copyOf));
    }

    private void validateCinemaSelection(String requestedCinemaId, String showScheduleCinemaId) {
        if (showScheduleCinemaId == null || showScheduleCinemaId.isBlank()) {
            throw new BusinessException("Lịch chiếu chưa có thông tin rạp");
        }
        if (requestedCinemaId != null && !requestedCinemaId.isBlank() && !showScheduleCinemaId.equals(requestedCinemaId.trim())) {
            throw new BusinessException("Rạp được chọn không khớp với lịch chiếu");
        }
    }

    private CheckoutSessionResponse toSessionResponse(CheckoutSessionCache cache) {
        return CheckoutSessionResponse.builder()
                .sessionId(cache.getSessionId())
                .orderId(cache.getOrderId())
                .customerId(cache.getCustomerId())
                .showScheduleId(cache.getShowScheduleId())
                .seats(cache.getSeats())
                .items(toProductItems(cache.getItems()))
                .promotionCode(cache.getPromotionCode())
                .seatSubtotal(cache.getSeatSubtotal())
                .productSubtotal(cache.getProductSubtotal())
                .promotionDiscount(cache.getPromotionDiscount())
                .pointDiscount(cache.getPointDiscount())
                .pointsRedeemed(cache.getPointsRedeemed())
                .availableLoyaltyPoints(cache.getAvailableLoyaltyPoints())
                .totalPayment(cache.getTotalPayment())
                .status(cache.getStatus().name())
                .expiresAt(cache.getExpiresAt())
                .build();
    }

    private List<CheckoutProductItemResponse> toProductItems(List<CheckoutProductItemCache> items) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        return items.stream()
                .map(item -> CheckoutProductItemResponse.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productImageUrl(item.getProductImageUrl())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();
    }

    private List<SeatItemResponse> toSeatItems(List<SeatRequestDto> seats) {
        if (seats == null || seats.isEmpty()) {
            return Collections.emptyList();
        }

        return seats.stream()
                .map(seat -> SeatItemResponse.builder()
                        .seatNumber(seat.getSeatNumber())
                        .price(seat.getFinalPrice() == null ? 0D : seat.getFinalPrice())
                        .build())
                .toList();
    }

    private String buildSeatNumber(String rowName, String columnName) {
        String row = rowName == null ? "" : rowName.trim();
        String column = columnName == null ? "" : columnName.trim();
        return row + column;
    }
}
