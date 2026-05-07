package com.movieticket.order.util.mapper;

import com.movieticket.order.dto.CinemaRoomExternalDTO;
import com.movieticket.order.dto.client.OrderHistoryResponse;
import com.movieticket.order.dto.client.ProductSnapshot;
import com.movieticket.order.dto.client.SeatSnapshot;
import com.movieticket.order.dto.client.ShowScheduleSnapshot;
import com.movieticket.order.entity.Order;
import org.springframework.stereotype.Component;

import java.util.Map;

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
                .totalPrice(order.getTotalPrice()) // Thêm cả giá gốc nếu cần
                .createdAt(order.getCreatedAt())
                .qrCode(order.getQrCode());
    }
}
