package com.movieticket.order.controller;

import com.movieticket.order.common.ApiResponse;
import com.movieticket.order.dto.request.CheckInRequest;
import com.movieticket.order.dto.request.OrderSearchRequest;
import com.movieticket.order.dto.request.SeatLockRequest;
import com.movieticket.order.dto.response.OrderDetailResponse;
import com.movieticket.order.dto.response.OrderSummaryResponse;
import com.movieticket.order.dto.response.TicketDetailResponse;
import com.movieticket.order.service.OrderManagementService;
import com.movieticket.order.service.OrderService;
import com.movieticket.order.service.ShowScheduleDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.movieticket.order.dto.client.OrderHistoryResponse;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderManagementService orderManagementService;
    private final OrderService orderService;
    private final ShowScheduleDetailService showScheduleDetailService;

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<OrderSummaryResponse>>> getOrders(
            @RequestHeader(value = "X-Cinema-Id", required = false) String cinemaId,
            OrderSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Page<OrderSummaryResponse> orders = orderManagementService.searchOrders(request, page, size, sortBy, direction, cinemaId);
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách đơn hàng thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetail(
            @PathVariable String id,
            @RequestHeader(value = "X-Cinema-Id", required = false) String cinemaId
    ) {
        OrderDetailResponse order = orderManagementService.getOrderDetail(id, cinemaId);
        return ResponseEntity.ok(ApiResponse.success(order, "Lấy chi tiết đơn hàng thành công"));
    }
    @GetMapping("ticket-detail/{id}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getOrderDetailByTicketId(
            @PathVariable(required = true) String id,
            @RequestHeader(value = "X-Cinema-Id", required = true) String cinemaId
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getTicketDetailByOrderId(id, cinemaId), "Lấy chi tiết đơn hàng theo vé thành công"));
    }
    @PostMapping("check-in-ticket")
    public ResponseEntity<ApiResponse<?>> checkInTicket(
            @RequestBody CheckInRequest request,
            @RequestHeader(value = "X-Cinema-Id", required = true) String cinemaId
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.checkIn(request, cinemaId), "Check-in vé thành công"));
    }

    @PostMapping("/seats/lock")
    public ResponseEntity<ApiResponse<Void>> lockSeats(
            @Valid @RequestBody SeatLockRequest request
    ) {
        showScheduleDetailService.lockSeats(request.getShowScheduleId(), request.getSeatIds());
        return ResponseEntity.ok(ApiResponse.success(null, "Khóa ghế thành công"));
    }

    @PostMapping("/seats/unlock")
    public ResponseEntity<ApiResponse<Void>> unlockSeats(
            @Valid @RequestBody SeatLockRequest request
    ) {
        showScheduleDetailService.unlockSeats(request.getShowScheduleId(), request.getSeatIds());
        return ResponseEntity.ok(ApiResponse.success(null, "Mở khóa ghế thành công"));
    }
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderHistoryResponse>>> getOrderHistory(@RequestHeader("X-User-Id") String customerId) {
        List<OrderHistoryResponse> history = orderService.customerTicketBookHistory(customerId);

        return ResponseEntity.ok(ApiResponse.success(history, ""));
    }

    @GetMapping("/customer/{orderId}")
    public ResponseEntity<ApiResponse<OrderHistoryResponse>> getOrderDetail(@PathVariable String orderId) {
        OrderHistoryResponse detail = orderService.getOrderDetail(orderId);
        return ResponseEntity.ok(ApiResponse.success(detail,""));
    }
}
