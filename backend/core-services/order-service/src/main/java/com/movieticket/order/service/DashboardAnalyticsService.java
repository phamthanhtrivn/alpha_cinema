package com.movieticket.order.service;

import com.movieticket.order.client.CinemaClient;
import com.movieticket.order.client.AiDashboardClient;
import com.movieticket.order.client.PaymentClient;
import com.movieticket.order.client.ProductClient;
import com.movieticket.order.client.ProductDashboardClient;
import com.movieticket.order.client.UserDashboardClient;
import com.movieticket.order.client.PaymentDashboardClient;
import com.movieticket.order.dto.client.ProductSnapshot;
import com.movieticket.order.dto.client.PaymentSnapshot;
import com.movieticket.order.dto.client.ShowScheduleSnapshot;
import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderDetail;
import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.entity.Promotion;
import com.movieticket.order.entity.ShowScheduleDetail;
import com.movieticket.order.entity.ShowSeatType;
import com.movieticket.order.repository.OrderRepository;
import com.movieticket.order.repository.PromotionRepository;
import com.movieticket.order.repository.ShowScheduleDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardAnalyticsService {

    private static final int POINT_VALUE_VND = 1_000;
    private static final List<OrderStatus> SUCCESS_STATUSES = List.of(OrderStatus.PAID, OrderStatus.CONFIRMED);
    private static final List<OrderStatus> FAILED_STATUSES = List.of(OrderStatus.FAILED, OrderStatus.CANCELLED, OrderStatus.EXPIRED);
    private static final List<ShowSeatType> BOOKED_SEAT_TYPES = List.of(ShowSeatType.LOCKED, ShowSeatType.SOLD, ShowSeatType.CHECKED_IN);
    private static final DashboardDependencies EMPTY_DEPENDENCIES = new DashboardDependencies(Map.of(), Map.of(), Map.of(), Map.of(), Map.of(), Map.of(), Map.of(), Map.of(), Map.of());

    private final OrderRepository orderRepository;
    private final PromotionRepository promotionRepository;
    private final ShowScheduleDetailRepository showScheduleDetailRepository;
    private final ProductClient productClient;
    private final CinemaClient cinemaClient;
    private final PaymentClient paymentClient;
    private final UserDashboardClient userDashboardClient;
    private final ProductDashboardClient productDashboardClient;
    private final PaymentDashboardClient paymentDashboardClient;
    private final AiDashboardClient aiDashboardClient;

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminDashboard(String range, Integer year, Integer month, Integer week, String cinemaId) {
        return getDashboard(range, year, month, week, cinemaId, null, true, true, true, true, false);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getManagerDashboard(String range, Integer year, Integer month, Integer week, String cinemaId) {
        return getDashboard(range, year, month, week, cinemaId, null, false, false, false, true, false);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStaffDashboard(String range, Integer year, Integer month, Integer week, String cinemaId, String employeeId) {
        return getDashboard(range, year, month, week, cinemaId, employeeId, false, false, false, false, true);
    }

    private Map<String, Object> getDashboard(
            String range,
            Integer year,
            Integer month,
            Integer week,
            String cinemaId,
            String employeeId,
            boolean includePromotions,
            boolean includeLoyalty,
            boolean includeReviews,
            boolean includeEmployees,
            boolean moviesUseCinemaScope
    ) {
        LocalDateTime[] bounds = resolveBounds(range, year, month, week);
        List<Order> allOrders = orderRepository.findAll();
        List<Order> cinemaScopedOrders = allOrders.stream()
                .filter(order -> cinemaId == null || cinemaId.isBlank() || cinemaId.equals(order.getCinemaId()))
                .filter(order -> isInRange(order.getCreatedAt(), bounds))
                .toList();
        List<Order> scopedOrders = cinemaScopedOrders.stream()
                .filter(order -> employeeId == null || employeeId.isBlank() || employeeId.equals(order.getEmployeeId()))
                .toList();
        List<Order> movieScopedOrders = moviesUseCinemaScope ? cinemaScopedOrders : scopedOrders;
        List<Promotion> promotions = includePromotions ? promotionRepository.findAll() : List.of();
        List<Order> successfulOrders = successfulOrders(scopedOrders);
        List<Order> successfulMovieOrders = successfulOrders(movieScopedOrders);
        List<String> productIds = successfulOrders.stream()
                .flatMap(order -> safeOrderDetails(order).stream())
                .map(OrderDetail::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        List<String> scheduleIds = successfulMovieOrders.stream()
                .flatMap(order -> safeScheduleDetails(order).stream())
                .map(ShowScheduleDetail::getShowScheduleId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        List<String> scopedOrderIds = scopedOrders.stream()
                .map(Order::getId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        List<String> customerIds = scopedOrders.stream()
                .map(Order::getCustomerId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        DashboardDependencies dependencies = Mono.zip(
                productDashboardClient.getDashboardAsync(range, year, month, week, cinemaId),
                includeUserDashboard(includeLoyalty, includeReviews, includeEmployees)
                ? userDashboardClient.getDashboardAsync(range, year, month, week, cinemaId)
                : Mono.just(Map.<String, Object>of()),
                paymentDashboardClient.getDashboardAsync(range, year, month, week),
                aiDashboardClient.getDashboardAsync(range, year, month, week),
                productClient.getProducts(productIds).defaultIfEmpty(Map.of()),
                productClient.getSchedulesBatch(scheduleIds)
                        .map(schedules -> schedules.stream()
                        .filter(schedule -> schedule.getId() != null)
                        .collect(Collectors.toMap(ShowScheduleSnapshot::getId, Function.identity(), (first, second) -> first)))
                        .defaultIfEmpty(Map.of()),
                paymentClient.getPaymentsByOrderIds(scopedOrderIds).defaultIfEmpty(Map.of()),
                userDashboardClient.getCustomerNamesByIds(customerIds)
        )
                .flatMap(tuple -> cinemaClient.getCinemaNamesByIds(employeeCinemaIds(tuple.getT2()))
                .defaultIfEmpty(Map.of())
                .map(cinemaNames -> new DashboardDependencies(
                tuple.getT1(),
                tuple.getT2(),
                tuple.getT3(),
                tuple.getT4(),
                tuple.getT5(),
                tuple.getT6(),
                tuple.getT7(),
                cinemaNames,
                tuple.getT8()
        )))
                .onErrorReturn(EMPTY_DEPENDENCIES)
                .blockOptional()
                .orElse(EMPTY_DEPENDENCIES);
        Map<String, Object> productDashboard = dependencies.productDashboard();
        Map<String, Object> userDashboard = dependencies.userDashboard();
        Map<String, Object> paymentDashboard = dependencies.paymentDashboard();
        Map<String, Object> aiDashboard = dependencies.aiDashboard();

        Map<String, Object> dashboard = row(
                "revenue", revenue(scopedOrders),
                "orders", orders(scopedOrders, paymentDashboard, dependencies.paymentMap(), dependencies.scheduleMap(), dependencies.customerNameMap(), dependencies.productMap(), productDashboard),
                "promotions", promotions(scopedOrders, promotions),
                "products", products(scopedOrders, dependencies.productMap()),
                "movies", movies(movieScopedOrders, productDashboard, dependencies.scheduleMap()),
                "schedules", schedules(productDashboard, dependencies.scheduleMap()),
                "loyalty", includeLoyalty ? enrichLoyalty(userDashboard.get("loyalty"), scopedOrders, allOrders) : emptyLoyalty(),
                "employees", includeEmployees ? enrichEmployees(userDashboard.get("employees"), scopedOrders, dependencies.cinemaNameMap()) : emptyEmployees(),
                "reviews", includeReviews ? enrichReviews(userDashboard.get("reviews"), productDashboard) : emptyReviews(),
                "ai", aiDashboard.isEmpty() ? emptyAiDashboard() : aiDashboard,
                "systemHealth", List.of()
        );
        dashboard.put("overview", overview(dashboard, scopedOrders, promotions));

        return dashboard;
    }

    private boolean includeUserDashboard(boolean includeLoyalty, boolean includeReviews, boolean includeEmployees) {
        return includeLoyalty || includeReviews || includeEmployees;
    }

    public Map<String, Object> getAdminDashboardSection(
            String section,
            String range,
            Integer year,
            Integer month,
            Integer week,
            String cinemaId
    ) {
        Map<String, Object> dashboard = getAdminDashboard(range, year, month, week, cinemaId);
        return switch (section) {
            case "revenue" ->
                row("revenue", dashboard.get("revenue"));
            case "customers" ->
                row("loyalty", dashboard.get("loyalty"));
            case "employees" ->
                row("employees", dashboard.get("employees"));
            case "reviews" ->
                row("reviews", dashboard.get("reviews"));
            case "movies" ->
                row("movies", dashboard.get("movies"));
            case "products" ->
                row("products", dashboard.get("products"));
            case "schedules" ->
                row("schedules", dashboard.get("schedules"));
            case "orders" ->
                row("orders", dashboard.get("orders"));
            case "promotions" ->
                row("promotions", dashboard.get("promotions"));
            default ->
                dashboard;
        };
    }

    private List<Map<String, Object>> overview(Map<String, Object> dashboard, List<Order> orders, List<Promotion> promotions) {
        Map<String, Object> revenue = asMap(dashboard.get("revenue"));
        List<?> schedules = asList(dashboard.get("schedules"));
        Map<String, Object> loyalty = asMap(dashboard.get("loyalty"));

        return List.of(
                metric("today-revenue", "Tổng doanh thu hôm nay", asNumber(revenue.get("totalRevenue")), "currency", "up"),
                metric("tickets-sold", "Tổng vé bán hôm nay", asNumber(revenue.get("totalTickets")), "number", "up"),
                metric("total-orders", "Tổng đơn hàng", orders.size(), "number", "up"),
                metric("paid-orders", "Đơn thanh toán thành công", countStatus(orders, SUCCESS_STATUSES), "number", "up"),
                metric("failed-orders", "Đơn thanh toán thất bại", countStatus(orders, FAILED_STATUSES), "number", "down"),
                metric("seat-occupancy", "Tỷ lệ lấp đầy ghế", seatOccupancy(schedules), "percent", "up"),
                metric("new-users", "Người dùng mới", asNumber(loyalty.get("newUsers")), "number", "flat"),
                metric("active-promotions", "Khuyến mãi đang chạy", activePromotionCount(promotions), "number", "up"),
                metric("today-schedules", "Suất chiếu hôm nay", schedules.size(), "number", "up")
        );
    }

    private long seatOccupancy(List<?> schedules) {
        long soldSeats = schedules.stream()
                .map(this::asMap)
                .mapToLong(schedule -> asNumber(schedule.get("soldSeats")))
                .sum();
        long totalSeats = schedules.stream()
                .map(this::asMap)
                .mapToLong(schedule -> asNumber(schedule.get("totalSeats")))
                .sum();
        return Math.round(percent(soldSeats, totalSeats));
    }

    private long activePromotionCount(List<Promotion> promotions) {
        return promotions.stream()
                .filter(this::isPromotionActive)
                .count();
    }

    private Map<String, Object> revenue(List<Order> orders) {
        List<Order> successfulOrders = successfulOrders(orders);
        int totalTickets = successfulOrders.stream()
                .map(Order::getShowScheduleDetails)
                .filter(Objects::nonNull)
                .mapToInt(List::size)
                .sum();
        int totalProducts = successfulOrders.stream()
                .flatMap(order -> safeOrderDetails(order).stream())
                .mapToInt(OrderDetail::getQuantity)
                .sum();
        long totalRevenue = Math.round(successfulOrders.stream().mapToDouble(Order::getTotalPayment).sum());

        Map<String, long[]> series = new LinkedHashMap<>();
        for (Order order : successfulOrders) {
            String label = labelFor(order.getCreatedAt());
            long[] values = series.computeIfAbsent(label, ignored -> new long[3]);
            values[0] += Math.round(order.getTotalPayment());
            values[1] += safeScheduleDetails(order).size();
            values[2] += safeOrderDetails(order).stream().mapToInt(OrderDetail::getQuantity).sum();
        }

        List<Map<String, Object>> points = series.entrySet().stream()
                .map(entry -> row(
                "label", entry.getKey(),
                "revenue", entry.getValue()[0],
                "tickets", entry.getValue()[1],
                "products", entry.getValue()[2]
        ))
                .toList();

        return row(
                "totalRevenue", totalRevenue,
                "totalTickets", totalTickets,
                "totalProducts", totalProducts,
                "comparison", row("value", 0, "direction", "flat", "label", "dữ liệu thực tế"),
                "series", points
        );
    }

    private Map<String, Object> orders(
            List<Order> orders,
            Map<String, Object> paymentDashboard,
            Map<String, PaymentSnapshot> paymentMap,
            Map<String, ShowScheduleSnapshot> scheduleMap,
            Map<String, String> customerNameMap,
            Map<String, ProductSnapshot> productMap,
            Map<String, Object> productDashboard
    ) {
        long total = Math.max(orders.size(), 1);
        long success = countStatus(orders, SUCCESS_STATUSES);
        List<Map<String, Object>> scopedPaymentMethods = summarizePaymentMethods(paymentMap);
        List<?> paymentMethods = scopedPaymentMethods.isEmpty() && !orders.isEmpty()
                ? asList(paymentDashboard.get("paymentMethods"))
                : scopedPaymentMethods;
        Object paymentSuccessRate = scopedPaymentMethods.isEmpty()
                ? (orders.isEmpty() ? 0 : paymentDashboard.getOrDefault("successRate", Math.round((success * 1000.0 / total)) / 10.0))
                : scopedPaymentSuccessRate(paymentMap);
        Map<String, String> movieLookup = movieLookup(productDashboard);

        List<Map<String, Object>> recentOrders = orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(order -> {
                    PaymentSnapshot payment = paymentMap.get(order.getId());
                    return row(
                            "id", order.getId(),
                            "customerName", customerNameMap.getOrDefault(order.getCustomerId(), order.getCustomerId()),
                            "movieTitle", firstOrderItemLabel(order, scheduleMap, movieLookup, productMap),
                            "paymentMethod", payment == null ? "-" : payment.getMethod(),
                            "paymentStatus", payment == null ? null : payment.getStatus(),
                            "paymentCode", payment == null ? null : payment.getPaymentCode(),
                            "providerTransactionId", payment == null ? null : payment.getProviderTransactionId(),
                            "status", order.getStatus() == null ? "PENDING_PAYMENT" : order.getStatus().name(),
                            "totalPayment", Math.round(order.getTotalPayment()),
                            "createdAt", order.getCreatedAt()
                    );
                })
                .toList();

        return row(
                "statuses", row(
                        "paid", success,
                        "pending", countStatus(orders, List.of(OrderStatus.PENDING_PAYMENT)),
                        "cancelled", countStatus(orders, List.of(OrderStatus.CANCELLED)),
                        "expired", countStatus(orders, List.of(OrderStatus.EXPIRED)),
                        "refunded", 0
                ),
                "successRate", paymentSuccessRate,
                "paymentMethods", paymentMethods,
                "recentOrders", recentOrders
        );
    }

    private double scopedPaymentSuccessRate(Map<String, PaymentSnapshot> paymentMap) {
        if (paymentMap == null || paymentMap.isEmpty()) {
            return 0;
        }
        long success = paymentMap.values().stream()
                .filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus()))
                .count();
        return Math.round(success * 1000.0 / paymentMap.size()) / 10.0;
    }

    private Map<String, Object> promotions(List<Order> orders, List<Promotion> promotions) {
        Map<String, List<Order>> ordersByPromotion = successfulOrders(orders).stream()
                .filter(order -> order.getPromotion() != null)
                .collect(Collectors.groupingBy(order -> order.getPromotion().getId()));
        LocalDateTime now = LocalDateTime.now();

        List<Map<String, Object>> topPromotions = promotions.stream()
                .map(promotion -> {
                    List<Order> usedOrders = ordersByPromotion.getOrDefault(promotion.getId(), List.of());
                    return row(
                            "id", promotion.getId(),
                            "code", promotion.getCode(),
                            "name", promotion.getCode(),
                            "ordersUsed", usedOrders.size(),
                            "discountValue", Math.round(usedOrders.stream().mapToDouble(Order::getPromotionDiscount).sum()),
                            "revenueAfterDiscount", Math.round(usedOrders.stream().mapToDouble(Order::getTotalPayment).sum()),
                            "status", promotionStatus(promotion, now),
                            "quota", promotion.getQuantity(),
                            "remaining", promotion.getRemainingQuantity()
                    );
                })
                .sorted(Comparator.comparingLong(item -> -asNumber(item.get("ordersUsed"))))
                .limit(5)
                .toList();

        long totalDiscount = Math.round(successfulOrders(orders).stream().mapToDouble(Order::getPromotionDiscount).sum());
        long ordersApplied = successfulOrders(orders).stream().filter(order -> order.getPromotion() != null).count();

        return row(
                "totalPromotions", promotions.size(),
                "ordersApplied", ordersApplied,
                "totalDiscountValue", totalDiscount,
                "averageDiscountValue", ordersApplied == 0 ? 0 : Math.round(totalDiscount * 1.0 / ordersApplied),
                "statuses", row(
                        "active", promotions.stream().filter(this::isPromotionActive).count(),
                        "upcoming", promotions.stream().filter(promotion -> promotion.getStartDate() != null && promotion.getStartDate().isAfter(now)).count(),
                        "expired", promotions.stream().filter(promotion -> promotion.getEndDate() != null && promotion.getEndDate().isBefore(now)).count(),
                        "paused", promotions.stream().filter(promotion -> !promotion.isStatus()).count()
                ),
                "topPromotions", topPromotions
        );
    }

    private List<Map<String, Object>> summarizePaymentMethods(Map<String, PaymentSnapshot> paymentMap) {
        List<String> methods = List.of("VNPAY", "MOMO", "CASH");

        Map<String, List<PaymentSnapshot>> byMethod = (paymentMap == null ? Map.<String, PaymentSnapshot>of() : paymentMap).values().stream()
                .filter(payment -> payment.getMethod() != null)
                .collect(Collectors.groupingBy(PaymentSnapshot::getMethod));

        return methods.stream()
                .map(method -> {
                    List<PaymentSnapshot> payments = byMethod.getOrDefault(method, List.of());
                    long success = payments.stream()
                            .filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus()))
                            .count();
                    long total = Math.max(payments.size(), 1);
                    long revenue = Math.round(payments.stream()
                            .filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus()))
                            .mapToDouble(PaymentSnapshot::getAmount)
                            .sum());
                    return row(
                            "method", method,
                            "orders", success,
                            "revenue", revenue,
                            "successRate", Math.round(success * 1000.0 / total) / 10.0
                    );
                })
                .toList();
    }

    private Map<String, Object> products(List<Order> orders, Map<String, ProductSnapshot> productMap) {
        List<Order> successfulOrders = successfulOrders(orders);
        List<OrderDetail> details = successfulOrders.stream()
                .flatMap(order -> safeOrderDetails(order).stream())
                .toList();

        Map<String, List<OrderDetail>> byProduct = details.stream()
                .filter(detail -> detail.getProductId() != null)
                .collect(Collectors.groupingBy(OrderDetail::getProductId));

        Map<String, ProductSnapshot> finalProductMap = productMap;
        List<Map<String, Object>> topProducts = byProduct.entrySet().stream()
                .map(entry -> {
                    ProductSnapshot product = finalProductMap.get(entry.getKey());
                    int quantity = entry.getValue().stream().mapToInt(OrderDetail::getQuantity).sum();
                    long revenue = Math.round(entry.getValue().stream().mapToDouble(OrderDetail::getSubTotal).sum());
                    return row(
                            "id", entry.getKey(),
                            "name", productLabel(entry.getKey(), product),
                            "pictureUrl", product == null ? "" : product.getPictureUrl(),
                            "quantitySold", quantity,
                            "revenue", revenue
                    );
                })
                .sorted(Comparator.comparingLong(item -> -asNumber(item.get("revenue"))))
                .limit(5)
                .toList();

        int productsSold = details.stream().mapToInt(OrderDetail::getQuantity).sum();
        long ticketOrders = successfulOrders.stream()
                .filter(order -> !safeScheduleDetails(order).isEmpty())
                .count();
        long ticketOrdersWithProducts = successfulOrders.stream()
                .filter(order -> !safeScheduleDetails(order).isEmpty())
                .filter(order -> safeOrderDetails(order).stream()
                        .anyMatch(detail -> detail.getProductId() != null && detail.getQuantity() > 0))
                .count();

        return row(
                "totalRevenue", Math.round(details.stream().mapToDouble(OrderDetail::getSubTotal).sum()),
                "itemsSold", productsSold,
                "comboAttachRate", ticketOrders == 0 ? 0 : Math.round(ticketOrdersWithProducts * 1000.0 / ticketOrders) / 10.0,
                "topProducts", topProducts,
                "lowStockProducts", List.of()
        );
    }

    private Map<String, Object> movies(
            List<Order> orders,
            Map<String, Object> productDashboard,
            Map<String, ShowScheduleSnapshot> schedules
    ) {
        List<ShowScheduleDetail> details = successfulOrders(orders).stream()
                .flatMap(order -> safeScheduleDetails(order).stream())
                .toList();
        Map<String, List<ShowScheduleDetail>> byMovie = details.stream()
                .filter(detail -> movieIdForDetail(detail, schedules) != null)
                .collect(Collectors.groupingBy(detail -> movieIdForDetail(detail, schedules)));

        Map<String, String> movieLookup = movieLookup(productDashboard);
        List<Map<String, Object>> movieRows = byMovie.entrySet().stream()
                .map(entry -> {
                    String title = schedules.values().stream()
                            .filter(schedule -> entry.getKey().equals(schedule.getMovieId()))
                            .map(ShowScheduleSnapshot::getMovieTitle)
                            .filter(Objects::nonNull)
                            .findFirst()
                            .orElseGet(() -> movieLookup.getOrDefault(entry.getKey(), entry.getKey()));
                    return row(
                            "id", entry.getKey(),
                            "title", title,
                            "revenue", Math.round(entry.getValue().stream().mapToDouble(ShowScheduleDetail::getFinalPrice).sum()),
                            "ticketsSold", entry.getValue().size(),
                            "occupancyRate", 0,
                            "status", "NOW_SHOWING"
                    );
                })
                .toList();

        List<Map<String, Object>> topRevenue = movieRows.stream()
                .sorted(Comparator.comparingLong(item -> -asNumber(item.get("revenue"))))
                .limit(5)
                .toList();
        List<Map<String, Object>> topTickets = movieRows.stream()
                .sorted(Comparator.comparingLong(item -> -asNumber(item.get("ticketsSold"))))
                .limit(5)
                .toList();
        Map<String, Object> productMovies = asMap(productDashboard.get("movies"));
        List<Map<String, Object>> scheduleCapacityRows = movieScheduleCapacityRows(productDashboard, schedules);
        Map<String, Long> bookedBySchedule = bookedSeatCounts(scheduleCapacityRows.stream()
                .map(schedule -> stringValue(schedule.get("id")))
                .filter(Objects::nonNull)
                .distinct()
                .toList());
        Map<String, Long> capacityByMovie = scheduleCapacityRows.stream()
                .filter(schedule -> schedule.get("movieId") != null)
                .collect(Collectors.groupingBy(
                        schedule -> String.valueOf(schedule.get("movieId")),
                        Collectors.summingLong(schedule -> asNumber(schedule.get("totalSeats")))
                ));
        Map<String, Long> bookedByMovie = scheduleCapacityRows.stream()
                .filter(schedule -> schedule.get("movieId") != null)
                .collect(Collectors.groupingBy(
                        schedule -> String.valueOf(schedule.get("movieId")),
                        Collectors.summingLong(schedule -> bookedBySchedule.getOrDefault(String.valueOf(schedule.get("id")), 0L))
                ));

        return row(
                "topRevenue", withMovieOccupancy(topRevenue, bookedByMovie, capacityByMovie),
                "topTickets", withMovieOccupancy(topTickets, bookedByMovie, capacityByMovie),
                "nowShowing", asNumber(productMovies.get("nowShowing")),
                "comingSoon", asNumber(productMovies.get("comingSoon"))
        );
    }

    private List<Map<String, Object>> schedules(
            Map<String, Object> productDashboard,
            Map<String, ShowScheduleSnapshot> schedules
    ) {
        List<Map<String, Object>> sourceSchedules = scheduleRows(productDashboard, schedules);
        Map<String, Long> soldBySchedule = bookedSeatCounts(sourceSchedules.stream()
                .map(schedule -> stringValue(schedule.get("id")))
                .filter(Objects::nonNull)
                .distinct()
                .toList());

        return sourceSchedules.stream()
                .map(schedule -> {
                    String scheduleId = String.valueOf(schedule.get("id"));
                    long sold = soldBySchedule.getOrDefault(scheduleId, 0L);
                    long currentTotal = asNumber(schedule.get("totalSeats"));
                    long total = Math.max(currentTotal, sold);
                    double occupancy = percent(sold, total);
                    return row(
                            "id", scheduleId,
                            "movieId", schedule.get("movieId"),
                            "cinemaId", schedule.get("cinemaId"),
                            "movieTitle", schedule.get("movieTitle"),
                            "cinemaName", schedule.get("cinemaName"),
                            "roomName", schedule.get("roomName"),
                            "startTime", schedule.get("startTime"),
                            "endTime", schedule.get("endTime"),
                            "status", sold >= total && total > 0 ? "SOLD_OUT" : occupancy >= 75 ? "NEAR_FULL" : schedule.get("status"),
                            "soldSeats", sold,
                            "totalSeats", total
                    );
                })
                .toList();
    }

    private List<Map<String, Object>> scheduleRows(
            Map<String, Object> productDashboard,
            Map<String, ShowScheduleSnapshot> schedules
    ) {
        Map<String, Map<String, Object>> rows = new LinkedHashMap<>();
        asMapList(productDashboard.get("schedules")).forEach(schedule -> {
            String id = stringValue(schedule.get("id"));
            if (id != null) {
                rows.put(id, schedule);
            }
        });

        schedules.values().forEach(schedule -> {
            if (schedule.getId() != null) {
                rows.putIfAbsent(schedule.getId(), row(
                        "id", schedule.getId(),
                        "movieId", schedule.getMovieId(),
                        "cinemaId", schedule.getCinemaId(),
                        "movieTitle", schedule.getMovieTitle(),
                        "cinemaName", schedule.getCinemaId(),
                        "roomName", schedule.getRoomId(),
                        "startTime", schedule.getStartTime(),
                        "endTime", schedule.getEndTime(),
                        "status", schedule.isStatus() ? "ON_SALE" : "ENDED",
                        "soldSeats", 0,
                        "totalSeats", schedule.getAvailableSeat()
                ));
            }
        });

        return List.copyOf(rows.values());
    }

    private Map<String, Long> bookedSeatCounts(List<String> scheduleIds) {
        if (scheduleIds == null || scheduleIds.isEmpty()) {
            return Map.of();
        }

        return showScheduleDetailRepository.countBookedSeatsByScheduleIds(scheduleIds, BOOKED_SEAT_TYPES, FAILED_STATUSES).stream()
                .filter(row -> row.length >= 2 && row[0] != null && row[1] instanceof Number)
                .collect(Collectors.toMap(
                        row -> String.valueOf(row[0]),
                        row -> ((Number) row[1]).longValue(),
                        Long::sum
                ));
    }

    private String movieIdForDetail(ShowScheduleDetail detail, Map<String, ShowScheduleSnapshot> schedules) {
        if (detail.getMovieId() != null) {
            return detail.getMovieId();
        }
        ShowScheduleSnapshot schedule = schedules.get(detail.getShowScheduleId());
        return schedule == null ? null : schedule.getMovieId();
    }

    private List<Map<String, Object>> movieScheduleCapacityRows(
            Map<String, Object> productDashboard,
            Map<String, ShowScheduleSnapshot> schedules
    ) {
        Map<String, Map<String, Object>> rows = new LinkedHashMap<>();
        asMapList(productDashboard.get("schedules")).forEach(schedule -> {
            String id = stringValue(schedule.get("id"));
            if (id != null) {
                rows.put(id, row(
                        "id", id,
                        "movieId", schedule.get("movieId"),
                        "totalSeats", schedule.get("totalSeats")
                ));
            }
        });

        schedules.values().forEach(schedule -> {
            if (schedule.getId() != null) {
                rows.putIfAbsent(schedule.getId(), row(
                        "id", schedule.getId(),
                        "movieId", schedule.getMovieId(),
                        "totalSeats", schedule.getAvailableSeat()
                ));
            }
        });

        return List.copyOf(rows.values());
    }

    private Map<String, String> movieLookup(Map<String, Object> productDashboard) {
        return asMapList(asMap(productDashboard.get("movies")).get("lookup")).stream()
                .filter(movie -> movie.get("id") != null)
                .collect(Collectors.toMap(
                        movie -> String.valueOf(movie.get("id")),
                        movie -> String.valueOf(movie.getOrDefault("title", movie.get("id"))),
                        (first, second) -> first
                ));
    }

    private List<Map<String, Object>> withMovieOccupancy(
            List<Map<String, Object>> movies,
            Map<String, Long> bookedByMovie,
            Map<String, Long> capacityByMovie
    ) {
        return movies.stream()
                .map(movie -> {
                    String movieId = stringValue(movie.get("id"));
                    long booked = Math.max(
                            movieId == null ? 0 : bookedByMovie.getOrDefault(movieId, 0L),
                            asNumber(movie.get("ticketsSold"))
                    );
                    long capacity = movieId == null ? 0 : capacityByMovie.getOrDefault(movieId, 0L);
                    Map<String, Object> row = new LinkedHashMap<>(movie);
                    row.put("occupancyRate", percent(booked, Math.max(capacity, booked)));
                    return row;
                })
                .toList();
    }

    private double percent(long value, long total) {
        if (total <= 0) {
            return 0;
        }
        return Math.round(value * 1000.0 / total) / 10.0;
    }

    private Map<String, Object> enrichLoyalty(Object loyaltyObject, List<Order> scopedOrders, List<Order> allOrders) {
        Map<String, Object> loyalty = new LinkedHashMap<>(asMap(loyaltyObject));
        if (loyalty.isEmpty()) {
            loyalty.putAll(emptyLoyalty());
        }

        List<Order> successfulScopedOrders = successfulOrders(scopedOrders);
        Set<String> scopedOrderIds = successfulScopedOrders.stream()
                .map(Order::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        long pointsRedeemed = successfulScopedOrders.stream()
                .mapToLong(this::pointsRedeemed)
                .sum();

        loyalty.put("pointsIssued", pointsIssued(scopedOrderIds, allOrders));
        loyalty.put("pointsRedeemed", pointsRedeemed);
        return loyalty;
    }

    private long pointsIssued(Set<String> scopedOrderIds, List<Order> allOrders) {
        if (scopedOrderIds.isEmpty()) {
            return 0;
        }

        Map<String, List<Order>> ordersByCustomer = successfulOrders(allOrders).stream()
                .filter(order -> order.getCustomerId() != null)
                .collect(Collectors.groupingBy(Order::getCustomerId));

        long totalIssued = 0;
        for (List<Order> customerOrders : ordersByCustomer.values()) {
            List<Order> sortedOrders = customerOrders.stream()
                    .sorted(Comparator
                            .comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                            .thenComparing(Order::getId, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                    .toList();

            double cumulativeSpending = 0D;
            for (Order order : sortedOrders) {
                double orderSpending = Math.max(order.getTotalPayment(), 0D);
                cumulativeSpending += orderSpending;
                if (scopedOrderIds.contains(order.getId())) {
                    totalIssued += earnedPoints(orderSpending, cumulativeSpending);
                }
            }
        }

        return totalIssued;
    }

    private long pointsRedeemed(Order order) {
        return Math.round(Math.max(order.getPointDiscount(), 0D) / POINT_VALUE_VND);
    }

    private long earnedPoints(double orderSpending, double totalSpendingAfterOrder) {
        double rate;
        if (totalSpendingAfterOrder < 2_000_000D) {
            rate = 0.03;
        } else if (totalSpendingAfterOrder < 4_000_000D) {
            rate = 0.05;
        } else {
            rate = 0.07;
        }
        return Math.round(Math.max(orderSpending, 0D) * rate / POINT_VALUE_VND);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> enrichEmployees(Object employeesObject, List<Order> orders, Map<String, String> cinemaNameMap) {
        Map<String, Object> employees = new LinkedHashMap<>(asMap(employeesObject));
        List<Map<String, Object>> topEmployees = asMapList(employees.get("topEmployees"));
        Map<String, List<Order>> ordersByEmployee = successfulOrders(orders).stream()
                .filter(order -> order.getEmployeeId() != null)
                .collect(Collectors.groupingBy(Order::getEmployeeId));

        List<Map<String, Object>> enriched = topEmployees.stream()
                .map(employee -> {
                    String employeeId = String.valueOf(employee.get("id"));
                    List<Order> handledOrders = ordersByEmployee.getOrDefault(employeeId, List.of());
                    Map<String, Object> row = new LinkedHashMap<>(employee);
                    if (row.get("name") == null || String.valueOf(row.get("name")).isBlank()) {
                        row.put("name", employeeId);
                    }
                    String cinemaId = stringValue(row.getOrDefault("cinemaId", row.get("cinemaName")));
                    if (cinemaId != null && !cinemaId.isBlank()) {
                        row.put("cinemaId", cinemaId);
                        row.put("cinemaName", cinemaNameMap.getOrDefault(cinemaId, stringValue(row.get("cinemaName"))));
                    }
                    row.put("ordersHandled", handledOrders.size());
                    row.put("revenueHandled", Math.round(handledOrders.stream().mapToDouble(Order::getTotalPayment).sum()));
                    return row;
                })
                .sorted(Comparator
                        .<Map<String, Object>>comparingLong(employee -> asNumber(employee.get("ordersHandled")))
                        .thenComparingLong(employee -> asNumber(employee.get("revenueHandled")))
                        .reversed()
                        .thenComparing(employee -> String.valueOf(employee.getOrDefault("name", "")), String.CASE_INSENSITIVE_ORDER))
                .limit(5)
                .toList();
        employees.put("topEmployees", enriched);
        return employees;
    }

    private List<String> employeeCinemaIds(Object userDashboard) {
        return asMapList(asMap(asMap(userDashboard).get("employees")).get("topEmployees")).stream()
                .map(employee -> stringValue(employee.getOrDefault("cinemaId", employee.get("cinemaName"))))
                .filter(value -> value != null && !value.isBlank() && !"N/A".equalsIgnoreCase(value))
                .distinct()
                .toList();
    }

    private Map<String, Object> enrichReviews(Object reviewsObject, Map<String, Object> productDashboard) {
        Map<String, Object> reviews = new LinkedHashMap<>(asMap(reviewsObject));
        if (reviews.isEmpty()) {
            return emptyReviews();
        }

        Map<String, String> movieLookup = asMapList(asMap(productDashboard.get("movies")).get("lookup")).stream()
                .filter(movie -> movie.get("id") != null)
                .collect(Collectors.toMap(
                        movie -> String.valueOf(movie.get("id")),
                        movie -> String.valueOf(movie.getOrDefault("title", movie.get("id"))),
                        (first, second) -> first
                ));

        List<Map<String, Object>> recentReviews = asMapList(reviews.get("recentReviews")).stream()
                .map(review -> {
                    Map<String, Object> row = new LinkedHashMap<>(review);
                    Object movieId = row.get("movieTitle");
                    if (movieId != null && movieLookup.containsKey(String.valueOf(movieId))) {
                        row.put("movieTitle", movieLookup.get(String.valueOf(movieId)));
                    }
                    return row;
                })
                .toList();

        reviews.put("recentReviews", recentReviews);
        return reviews;
    }

    private Map<String, ShowScheduleSnapshot> getScheduleMap(List<ShowScheduleDetail> details) {
        List<String> scheduleIds = details.stream()
                .map(ShowScheduleDetail::getShowScheduleId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        return productClient.getSchedulesBatch(scheduleIds)
                .blockOptional()
                .orElse(List.of())
                .stream()
                .filter(schedule -> schedule.getId() != null)
                .collect(Collectors.toMap(ShowScheduleSnapshot::getId, Function.identity(), (first, second) -> first));
    }

    private String firstOrderItemLabel(
            Order order,
            Map<String, ShowScheduleSnapshot> scheduleSnapshotMap,
            Map<String, String> movieLookup,
            Map<String, ProductSnapshot> productMap
    ) {
        String movieLabel = safeScheduleDetails(order).stream()
                .map(detail -> movieLabelForDetail(detail, scheduleSnapshotMap, movieLookup))
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
        if (movieLabel != null) {
            return movieLabel;
        }

        List<String> productLabels = safeOrderDetails(order).stream()
                .map(detail -> productLabel(detail.getProductId(), productMap.get(detail.getProductId())))
                .filter(Objects::nonNull)
                .distinct()
                .limit(3)
                .toList();

        return productLabels.isEmpty() ? "N/A" : String.join(", ", productLabels);
    }

    private String movieLabelForDetail(
            ShowScheduleDetail detail,
            Map<String, ShowScheduleSnapshot> scheduleSnapshotMap,
            Map<String, String> movieLookup
    ) {
        ShowScheduleSnapshot snapshot = scheduleSnapshotMap.get(detail.getShowScheduleId());
        String title = cleanLabel(snapshot == null ? null : snapshot.getMovieTitle());
        if (title != null) {
            return title;
        }

        String movieId = detail.getMovieId() == null && snapshot != null ? snapshot.getMovieId() : detail.getMovieId();
        return cleanLabel(movieLookup.get(movieId));
    }

    private String productLabel(String productId, ProductSnapshot product) {
        String name = cleanLabel(product == null ? null : product.getName());
        return name == null ? cleanLabel(productId) : name;
    }

    private String cleanLabel(String value) {
        if (value == null || value.isBlank() || "N/A".equalsIgnoreCase(value)) {
            return null;
        }
        return value;
    }

    private String promotionStatus(Promotion promotion, LocalDateTime now) {
        if (!promotion.isStatus()) {
            return "PAUSED";
        }
        if (promotion.getStartDate() != null && promotion.getStartDate().isAfter(now)) {
            return "UPCOMING";
        }
        if (promotion.getEndDate() != null && promotion.getEndDate().isBefore(now)) {
            return "EXPIRED";
        }
        return "ACTIVE";
    }

    private boolean isPromotionActive(Promotion promotion) {
        return "ACTIVE".equals(promotionStatus(promotion, LocalDateTime.now()));
    }

    private List<Order> successfulOrders(List<Order> orders) {
        return orders.stream()
                .filter(order -> order.getStatus() != null && SUCCESS_STATUSES.contains(order.getStatus()))
                .toList();
    }

    private long countStatus(List<Order> orders, List<OrderStatus> statuses) {
        return orders.stream()
                .filter(order -> order.getStatus() != null && statuses.contains(order.getStatus()))
                .count();
    }

    private List<OrderDetail> safeOrderDetails(Order order) {
        return order.getOrderDetails() == null ? List.of() : order.getOrderDetails();
    }

    private List<ShowScheduleDetail> safeScheduleDetails(Order order) {
        return order.getShowScheduleDetails() == null ? List.of() : order.getShowScheduleDetails();
    }

    private Map<String, Object> metric(String id, String title, long value, String format, String direction) {
        return row(
                "id", id,
                "title", title,
                "value", value,
                "format", format,
                "trend", row("value", 0, "direction", direction, "label", "dữ liệu thực tế")
        );
    }

    private LocalDateTime[] resolveBounds(String range, Integer year, Integer month, Integer week) {
        LocalDateTime now = LocalDateTime.now();
        if ("all-time".equals(range)) {
            return null;
        }

        int safeYear = Objects.requireNonNullElse(year, now.getYear());
        if ("year".equals(range)) {
            LocalDateTime start = LocalDateTime.of(safeYear, 1, 1, 0, 0);
            return new LocalDateTime[]{start, start.plusYears(1)};
        }

        int safeMonth = Math.max(1, Math.min(12, Objects.requireNonNullElse(month, now.getMonthValue())));
        YearMonth yearMonth = YearMonth.of(safeYear, safeMonth);
        if ("month".equals(range)) {
            LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
            return new LocalDateTime[]{start, start.plusMonths(1)};
        }

        int safeWeek = Math.max(1, Math.min(5, Objects.requireNonNullElse(week, currentWeekOfMonth(now))));
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay().plusDays((long) (safeWeek - 1) * 7);
        LocalDateTime end = start.plusDays(7);
        LocalDateTime monthEnd = yearMonth.atEndOfMonth().atTime(23, 59, 59).plusSeconds(1);
        return new LocalDateTime[]{start, end.isAfter(monthEnd) ? monthEnd : end};
    }

    private boolean isInRange(LocalDateTime value, LocalDateTime[] bounds) {
        if (value == null || bounds == null) {
            return true;
        }
        return !value.isBefore(bounds[0]) && value.isBefore(bounds[1]);
    }

    private String labelFor(LocalDateTime value) {
        if (value == null) {
            return "N/A";
        }
        return value.getDayOfMonth() + "/" + value.getMonthValue();
    }

    private Map<String, Object> emptyLoyalty() {
        return row("pointsIssued", 0, "pointsRedeemed", 0, "tiers", List.of(), "topCustomers", List.of());
    }

    private Map<String, Object> emptyReviews() {
        return row("averageRating", 0, "totalReviews", 0, "pendingReviews", 0, "resolvedReviews", 0, "ratingDistribution", List.of(), "recentReviews", List.of());
    }

    private Map<String, Object> emptyEmployees() {
        return row("totalEmployees", 0, "activeEmployees", 0, "inactiveEmployees", 0, "roles", List.of(), "topEmployees", List.of());
    }

    private Map<String, Object> emptyAiDashboard() {
        return row(
                "totalConversations", 0,
                "totalUserQuestions", 0,
                "totalAssistantAnswers", 0,
                "averageMessagesPerConversation", 0,
                "guestConversations", 0,
                "memberConversations", 0,
                "popularQuestions", List.of(),
                "questionTrend", List.of(),
                "recentQuestions", List.of(),
                "recentConversations", List.of(),
                "totalChats", 0,
                "successRate", 0
        );
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> asMapList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream()
                    .filter(item -> item instanceof Map<?, ?>)
                    .map(item -> (Map<String, Object>) item)
                    .toList();
        }
        return List.of();
    }

    private List<?> asList(Object value) {
        return value instanceof List<?> list ? list : List.of();
    }

    private long asNumber(Object value) {
        if (value instanceof Number number) {
            return Math.round(number.doubleValue());
        }
        return 0;
    }

    private String stringValue(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value);
        return text.isBlank() ? null : text;
    }

    private int currentWeekOfMonth(LocalDateTime value) {
        return (int) Math.ceil(value.getDayOfMonth() / 7.0);
    }

    private Map<String, Object> row(Object... pairs) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int index = 0; index < pairs.length - 1; index += 2) {
            map.put(String.valueOf(pairs[index]), pairs[index + 1]);
        }
        return map;
    }

    private record DashboardDependencies(
            Map<String, Object> productDashboard,
            Map<String, Object> userDashboard,
            Map<String, Object> paymentDashboard,
            Map<String, Object> aiDashboard,
            Map<String, ProductSnapshot> productMap,
            Map<String, ShowScheduleSnapshot> scheduleMap,
            Map<String, PaymentSnapshot> paymentMap,
            Map<String, String> cinemaNameMap,
            Map<String, String> customerNameMap
            ) {

    }
}
