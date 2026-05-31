package com.movieticket.order.util.mapper;

import com.movieticket.order.dto.CinemaRoomExternalDTO;
import com.movieticket.order.dto.client.*;
import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderDetail;
import com.movieticket.order.entity.ShowScheduleDetail;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class OrderHistoryMapper {

    public OrderHistoryResponse toSummaryResponse(Order order,
                                                  Map<String, ShowScheduleSnapshot> scheduleMap,
                                                  Map<String, CinemaRoomExternalDTO> roomMap,
                                                  Map<String, String> cinemaNameMap) { // 1. Thêm parameter này vào

        // 1. Lấy thông tin suất chiếu từ Map (nếu có)
        ShowScheduleSnapshot schedule = null;
        if (order.getShowScheduleDetails() != null && !order.getShowScheduleDetails().isEmpty()) {
            String scheduleId = order.getShowScheduleDetails().get(0).getShowScheduleId();
            schedule = scheduleMap.get(scheduleId);
        }

        // 2. Tìm thông tin rạp/phòng dựa trên roomId có trong snapshot
        String roomId = (schedule != null) ? schedule.getRoomId() : null;
        CinemaRoomExternalDTO room = (roomId != null) ? roomMap.get(roomId) : null;

        // 3. Logic "bất tử" cứu cánh cho Tên Rạp (Cinema Name)
        String finalCinemaName = "N/A";
        if (room != null) {
            // Ưu tiên 1: Lấy tên rạp đi kèm từ thông tin phòng chiếu
            finalCinemaName = room.getCinemaName();
        } else if (order.getCinemaId() != null && cinemaNameMap.containsKey(order.getCinemaId())) {
            // Ưu tiên 2: Suất chiếu/Phòng bị null? Lấy thẳng tên rạp từ Map cứu cánh thông qua cinemaId trong Order
            finalCinemaName = cinemaNameMap.get(order.getCinemaId());
        }

        return baseBuilder(order)
                .showScheduleSnapshot(schedule)
                .cinemaName(finalCinemaName) // Ăn theo biến chuẩn đã check bọc lót ở trên
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
                .pointDiscount(order.getPointDiscount())
                .promotionDiscount(order.getPromotionDiscount())
                .promotionCode(order.getPromotion() == null ? null : order.getPromotion().getCode())
                .createdAt(order.getCreatedAt())
                .qrCode(order.getQrCode());
    }

    public OrderHistoryResponse toDetailResponse(
            Order order,
            ShowScheduleSnapshot schedule,
            CinemaRoomExternalDTO room,
            Map<String, SeatSnapshot> seatMap,
            Map<String, ProductSnapshot> productMap,
            Map<String, String> cinemaNameMap) { // 1. Thêm param này vào khớp với Service

        // 1. Xử lý danh sách GHẾ (Lấy thông tin rạp + Giá từ đơn hàng)
        List<ShowScheduleDetail> showScheduleDetails = order.getShowScheduleDetails() == null
                ? List.of()
                : order.getShowScheduleDetails();
        List<OrderDetail> orderDetails = order.getOrderDetails() == null ? List.of() : order.getOrderDetails();

        List<SeatSnapshot> seatSnapshots = showScheduleDetails.stream()
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
        List<ProductSnapshot> productItems = orderDetails.stream()
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

        // 3. Logic "bất tử" cho Tên Rạp (Cinema Name)
        String finalCinemaName = "N/A";
        if (room != null) {
            finalCinemaName = room.getCinemaName(); // Ưu tiên lấy từ Room
        } else if (order.getCinemaId() != null && cinemaNameMap.containsKey(order.getCinemaId())) {
            finalCinemaName = cinemaNameMap.get(order.getCinemaId()); // Cứu cánh bằng cinemaId trực tiếp từ Order
        }

        // 4. Trả về Response hoàn chỉnh
        return baseBuilder(order)
                .cinemaName(finalCinemaName) // <--- Ăn theo biến an toàn mới nặn ở trên
                .roomNumber(room != null ? room.getRoomNumber() : "N/A")
                .showScheduleSnapshot(schedule)
                .seats(seatSnapshots)
                .products(productItems)
                .build();
    }
}
