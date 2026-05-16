package com.movieticket.ai.tool;

import com.movieticket.ai.client.OrderServiceClient;
import com.movieticket.ai.client.UserServiceClient;
import com.movieticket.ai.dto.tool.CustomerMembershipToolResponse;
import com.movieticket.ai.dto.tool.OrderDetailToolResponse;
import com.movieticket.ai.dto.tool.OrderToolResponse;
import com.movieticket.ai.dto.tool.PromotionToolResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AlphaCustomerTool {
    private static final int DEFAULT_RECENT_ORDER_LIMIT = 5;

    private final UserServiceClient userServiceClient;
    private final OrderServiceClient orderServiceClient;

    @Tool(description = "Lấy điểm tích lũy và hạng thành viên của khách hàng đang đăng nhập. Dùng khi người dùng hỏi về điểm, hạng thành viên hoặc ưu đãi thành viên.")
    public CustomerMembershipToolResponse getCustomerMembership() {
        String customerId = AiCustomerContext.getCustomerId();
        return userServiceClient.getCustomerMembership(customerId);
    }

    @Tool(description = "Lấy danh sách mã khuyến mãi đang hoạt động và còn lượt sử dụng để khách hàng có thể áp dụng khi đặt vé. Dùng khi người dùng hỏi hiện tại có khuyến mãi, mã giảm giá, voucher, coupon hoặc ưu đãi nào không.")
    public List<PromotionToolResponse> getActivePromotions() {
        return orderServiceClient.getActivePromotions();
    }

    @Tool(description = "Lấy danh sách các đơn hàng gần đây của khách hàng đang đăng nhập. Dùng khi người dùng hỏi về đơn hàng gần nhất, vé đã đặt gần đây hoặc lịch sử đặt vé. Mặc định limit = 5.")
    public List<OrderToolResponse> getRecentOrders(
            @ToolParam(description = "Số đơn hàng gần đây cần lấy. Nếu người dùng không nói rõ thì dùng 5.")
            Integer limit
    ) {
        String customerId = AiCustomerContext.getCustomerId();
        return orderServiceClient.getRecentOrders(
                customerId,
                limit == null ? DEFAULT_RECENT_ORDER_LIMIT : limit
        );
    }

    @Tool(description = "Lấy trạng thái một đơn hàng của khách hàng đang đăng nhập theo mã đơn/orderCode. Dùng khi người dùng hỏi đơn hàng đang ở trạng thái nào hoặc đã thanh toán chưa.")
    public OrderToolResponse getOrderStatus(
            @ToolParam(description = "Mã đơn hàng/orderCode do người dùng cung cấp.")
            String orderCode
    ) {
        String customerId = AiCustomerContext.getCustomerId();
        return orderServiceClient.getOrderStatus(orderCode, customerId);
    }

    @Tool(description = "Lấy đầy đủ chi tiết một đơn hàng của khách hàng đang đăng nhập, gồm phim, suất chiếu, rạp, phòng, ghế, sản phẩm/combo, tổng tiền, giảm giá điểm, mã khuyến mãi, QR và trạng thái. Dùng khi người dùng hỏi chi tiết một đơn hàng cụ thể.")
    public OrderDetailToolResponse getOrderDetail(
            @ToolParam(description = "Mã đơn hàng/orderId do người dùng cung cấp.")
            String orderId
    ) {
        String customerId = AiCustomerContext.getCustomerId();
        return orderServiceClient.getOrderDetail(orderId, customerId);
    }
}