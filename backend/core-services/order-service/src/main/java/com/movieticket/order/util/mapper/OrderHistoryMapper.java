package com.movieticket.order.util.mapper;

import com.movieticket.order.dto.CinemaRoomExternalDTO;
import com.movieticket.order.dto.client.*;
import com.movieticket.order.entity.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class OrderHistoryMapper {

    public OrderHistoryResponse toSummaryResponse(Order order,
                                                  Map<String, ShowScheduleSnapshot> scheduleMap,
                                                  Map<String, CinemaRoomExternalDTO> roomMap) {

        // 1. Lấy thông tin suất chiếu từ Map
        String scheduleId = order.getShowScheduleDetails().get(0).getShowScheduleId();
        ShowScheduleSnapshot schedule = scheduleMap.get(scheduleId);

        // 2. Tìm thông tin rạp/phòng dựa trên roomId có trong snapshot
        // Đây chính là đoạn "đắp thịt" còn thiếu nè bro:
        String roomId = (schedule != null) ? schedule.getRoomId() : null;
        CinemaRoomExternalDTO room = (roomId != null) ? roomMap.get(roomId) : null;

        return baseBuilder(order)
                .showScheduleSnapshot(schedule)
                // Đưa thẳng dữ liệu ra ngoài root level của DTO
                .cinemaName(room != null ? room.getCinemaName() : "N/A")
                .roomNumber(room != null ? room.getRoomNumber() : "N/A")
                .seats(null)      // Để null cho nhẹ khi load danh sách
                .products(null)   // Để null cho nhẹ khi load danh sách
                .build();
    }

    private OrderHistoryResponse.OrderHistoryResponseBuilder baseBuilder(Order order) {
        return OrderHistoryResponse.builder()
                .id(order.getId())
                .totalPayment(order.getTotalPayment())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice()) // Thêm cả giá gốc nếu cần
                .createdAt(order.getCreatedAt())
                .qrCode(order.getQrCode());
    }

    public OrderHistoryResponse toDetailResponse(
            Order order,
            ShowScheduleSnapshot schedule,
            CinemaRoomExternalDTO room,
            Map<String, SeatSnapshot> seatMap,
            Map<String, ProductSnapshot> productMap) {

        // 1. Xử lý danh sách GHẾ (Lấy thông tin rạp + Giá từ đơn hàng)
        List<SeatSnapshot> seatSnapshots = order.getShowScheduleDetails().stream()
                .map(detail -> {
                    // Tìm thông tin ghế "tĩnh" từ Cinema Service
                    SeatSnapshot s = seatMap.get(detail.getSeatId());
                    if (s == null) return null;

                    // Tạo đối tượng mới để trả về, gán giá thực tế từ Detail
                    return SeatSnapshot.builder()
                            .id(s.getId())
                            .rowName(s.getRowName())
                            .columnName(s.getColumnName())
                            .roomId(s.getRoomId())
                            .seatTypeId(s.getSeatTypeId())
                            .status(s.isStatus())
                            .unitPrice(detail.getFinalPrice()) // <--- Đắp giá từ ShowScheduleDetail vào đây
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        // 2. Xử lý danh sách BẮP NƯỚC (Lấy thông tin sản phẩm + Giá/Số lượng từ đơn hàng)
        List<ProductSnapshot> productItems = order.getOrderDetails().stream()
                .map(detail -> {
                    ProductSnapshot p = productMap.get(detail.getProductId());
                    return ProductSnapshot.builder()
                            .id(p != null ? p.getId() : detail.getProductId())
                            .name(p != null ? p.getName() : "Sản phẩm đi kèm")
                            .pictureUrl(p != null ? p.getPictureUrl() : null)
                            .quantity(detail.getQuantity())   // Lấy số lượng thực tế lúc mua
                            .unitPrice(detail.getPrice())     // Lấy giá thực tế lúc mua
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        // 3. Trả về Response hoàn chỉnh
        return baseBuilder(order)
                .cinemaName(room != null ? room.getCinemaName() : "N/A")
                .roomNumber(room != null ? room.getRoomNumber() : "N/A")
                .showScheduleSnapshot(schedule)
                .seats(seatSnapshots)
                .products(productItems)
                .build();
    }
}
