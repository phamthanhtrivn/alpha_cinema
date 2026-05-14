package com.movieticket.payment.service;

import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.entity.PaymentMethod;
import com.movieticket.payment.entity.PaymentStatus;
import com.movieticket.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PaymentDashboardAnalyticsService {
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String range, Integer year, Integer month, Integer week) {
        LocalDateTime[] bounds = resolveBounds(range, year, month, week);
        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(payment -> isInRange(payment.getCreatedAt(), bounds))
                .toList();
        long total = Math.max(payments.size(), 1);
        long success = payments.stream().filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS).count();

        List<Map<String, Object>> paymentMethods = Arrays.stream(PaymentMethod.values())
                .map(method -> methodSummary(method, payments))
                .toList();

        return row(
                "successRate", Math.round(success * 1000.0 / total) / 10.0,
                "paymentMethods", paymentMethods
        );
    }

    private Map<String, Object> methodSummary(PaymentMethod method, List<Payment> payments) {
        List<Payment> methodPayments = payments.stream()
                .filter(payment -> payment.getMethod() == method)
                .toList();
        long total = Math.max(methodPayments.size(), 1);
        long success = methodPayments.stream().filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS).count();
        long revenue = Math.round(methodPayments.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum());

        return row(
                "method", method.name(),
                "orders", success,
                "revenue", revenue,
                "successRate", Math.round(success * 1000.0 / total) / 10.0
        );
    }

    private boolean isInRange(LocalDateTime value, LocalDateTime[] bounds) {
        if (value == null || bounds == null) {
            return true;
        }
        return !value.isBefore(bounds[0]) && value.isBefore(bounds[1]);
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

    private Map<String, Object> row(Object... pairs) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int index = 0; index < pairs.length - 1; index += 2) {
            map.put(String.valueOf(pairs[index]), pairs[index + 1]);
        }
        return map;
    }

    private int currentWeekOfMonth(LocalDateTime value) {
        return (int) Math.ceil(value.getDayOfMonth() / 7.0);
    }
}
