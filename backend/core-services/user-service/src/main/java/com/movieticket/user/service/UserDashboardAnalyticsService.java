package com.movieticket.user.service;

import com.movieticket.user.entity.Customer;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.entity.Review;
import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.enums.ReviewStatus;
import com.movieticket.user.repository.CustomerRepository;
import com.movieticket.user.repository.EmployeeRepository;
import com.movieticket.user.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDashboardAnalyticsService {
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String range, Integer year, Integer month, Integer week, String cinemaId) {
        LocalDateTime[] bounds = resolveBounds(range, year, month, week);
        List<Customer> customers = customerRepository.findAll();
        List<Employee> employees = employeeRepository.findAll();
        List<Review> reviews = reviewRepository.findAll();

        List<Customer> scopedCustomers = customers.stream()
                .filter(customer -> isInRange(customer.getCreatedAt(), bounds))
                .toList();
        List<Employee> scopedEmployees = employees.stream()
                .filter(employee -> cinemaId == null || cinemaId.isBlank() || cinemaId.equals(employee.getCinemaId()))
                .toList();
        List<Review> scopedReviews = reviews.stream()
                .filter(review -> isInRange(review.getCreatedAt(), bounds))
                .toList();

        return row(
                "loyalty", loyalty(customers, scopedCustomers),
                "employees", employees(scopedEmployees),
                "reviews", reviews(scopedReviews)
        );
    }

    private Map<String, Object> loyalty(List<Customer> allCustomers, List<Customer> scopedCustomers) {
        int issued = scopedCustomers.stream().mapToInt(Customer::getLoyaltyPoint).sum();
        List<Map<String, Object>> tiers = List.of(
                row("tier", CustomerType.MEMBER.name(), "members", countCustomerType(allCustomers, CustomerType.MEMBER)),
                row("tier", CustomerType.SILVER.name(), "members", countCustomerType(allCustomers, CustomerType.SILVER)),
                row("tier", CustomerType.GOLD.name(), "members", countCustomerType(allCustomers, CustomerType.GOLD))
        );

        List<Map<String, Object>> topCustomers = allCustomers.stream()
                .sorted(Comparator.comparingDouble(Customer::getTotalSpending).reversed())
                .limit(5)
                .map(customer -> row(
                        "id", customer.getId(),
                        "name", customer.getFullName(),
                        "totalSpending", Math.round(customer.getTotalSpending()),
                        "loyaltyPoint", customer.getLoyaltyPoint()
                ))
                .toList();

        return row(
                "newUsers", scopedCustomers.size(),
                "pointsIssued", issued,
                "pointsRedeemed", 0,
                "tiers", tiers,
                "topCustomers", topCustomers
        );
    }

    private Map<String, Object> employees(List<Employee> employees) {
        long active = employees.stream().filter(Employee::isStatus).count();
        List<Map<String, Object>> roles = List.of(
                row("role", "ADMIN", "total", countEmployeeRole(employees, EmployeeRole.ADMIN)),
                row("role", "MANAGER", "total", countEmployeeRole(employees, EmployeeRole.MANAGER)),
                row("role", "STAFF", "total", countEmployeeRole(employees, EmployeeRole.STAFF))
        );

        List<Map<String, Object>> topEmployees = employees.stream()
                .sorted(Comparator.comparing(Employee::getFullName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .map(employee -> row(
                        "id", employee.getId(),
                        "name", employee.getFullName() == null || employee.getFullName().isBlank() ? employee.getId() : employee.getFullName(),
                        "role", employee.getRole() == null ? "STAFF" : employee.getRole().name(),
                        "cinemaId", employee.getCinemaId(),
                        "cinemaName", employee.getCinemaId() == null ? "N/A" : employee.getCinemaId(),
                        "ordersHandled", 0,
                        "revenueHandled", 0
                ))
                .toList();

        return row(
                "totalEmployees", employees.size(),
                "activeEmployees", active,
                "inactiveEmployees", employees.size() - active,
                "roles", roles,
                "topEmployees", topEmployees
        );
    }

    private Map<String, Object> reviews(List<Review> reviews) {
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0);

        Map<Integer, Long> distribution = reviews.stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));

        List<Map<String, Object>> ratingDistribution = List.of(10, 9, 8, 7, 6, 5, 4, 3, 2, 1).stream()
                .map(rating -> row("rating", rating, "count", distribution.getOrDefault(rating, 0L)))
                .toList();

        List<Map<String, Object>> recentReviews = reviews.stream()
                .sorted(Comparator.comparing(Review::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(review -> row(
                        "id", review.getId(),
                        "customerName", review.getCustomer() == null ? "N/A" : review.getCustomer().getFullName(),
                        "movieTitle", review.getMovieId(),
                        "rating", review.getRating(),
                        "comment", review.getComment(),
                        "createdAt", review.getCreatedAt()
                ))
                .toList();

        return row(
                "averageRating", Math.round(averageRating * 10.0) / 10.0,
                "totalReviews", reviews.size(),
                "pendingReviews", reviews.stream().filter(review -> review.getStatus() == ReviewStatus.PENDING).count(),
                "resolvedReviews", reviews.stream().filter(review -> review.getStatus() == ReviewStatus.APPROVED).count(),
                "ratingDistribution", ratingDistribution,
                "recentReviews", recentReviews
        );
    }

    private long countCustomerType(List<Customer> customers, CustomerType type) {
        return customers.stream().filter(customer -> customer.getCustomerType() == type).count();
    }

    private long countEmployeeRole(List<Employee> employees, EmployeeRole role) {
        return employees.stream().filter(employee -> employee.getRole() == role).count();
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
