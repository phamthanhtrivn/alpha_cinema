package com.movieticket.ai.tool;

import com.movieticket.ai.client.TicketServiceClient;
import com.movieticket.ai.dto.tool.TicketPriceToolResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AlphaTicketTool {
    private final TicketServiceClient ticketServiceClient;

    @Tool(description = "Lấy bảng giá vé theo loại ghế, định dạng chiếu và loại ngày. Quy tắc sử dụng dayType: WEEKDAY là từ thứ 2 đến thứ 6; WEEKEND_BEFORE_17 là thứ 7/chủ nhật trước 17:00; WEEKEND_AFTER_17 là thứ 7/chủ nhật từ 17:00 trở đi; HOLIDAY là ngày lễ/tết có trong bảng Holiday đang active.")
    public List<TicketPriceToolResponse> getTicketPrices(
            @ToolParam(description = "Tên loại ghế, ví dụ: ghế thường, ghế đôi, VIP. Có thể để trống nếu người dùng hỏi bảng giá chung.")
            String seatTypeName,

            @ToolParam(description = "Định dạng chiếu: 2D, 3D hoặc IMAX. Có thể để trống.")
            String projectionType,

            @ToolParam(description = "Loại ngày: WEEKDAY, WEEKEND_BEFORE_17, WEEKEND_AFTER_17 hoặc HOLIDAY. Nếu khách hàng đưa ngày/giờ cụ thể thì nên dùng determineTicketPrices thay vì tự đoán dayType.")
            String dayType
    ) {
        return ticketServiceClient.getTicketPrices(seatTypeName, projectionType, dayType);
    }

    @Tool(description = "Tính giá vé cho một suất chiếu cụ thể khi đã biết seatTypeId, projectionType và showTime. Nếu người dùng chỉ nói tên loại ghế như VIP thì dùng determineTicketPrices. Tool này tự xác định dayType bằng bảng Holiday: nếu ngày đó là holiday active thì là HOLIDAY; nếu không thì thứ 2 đến thứ 6 là WEEKDAY; thứ 7/chủ nhật trước 17:00 là WEEKEND_BEFORE_17; từ 17:00 trở đi là WEEKEND_AFTER_17.")
    public TicketPriceToolResponse determineTicketPrice(
            @ToolParam(description = "Mã loại ghế seatTypeId lấy từ kết quả getTicketPrices hoặc từ dữ liệu ghế.")
            String seatTypeId,

            @ToolParam(description = "Định dạng chiếu: 2D, 3D hoặc IMAX.")
            String projectionType,

            @ToolParam(description = "Thời gian chiếu theo định dạng ISO datetime, ví dụ: 2026-05-15T19:30:00.")
            String showTime
    ) {
        return ticketServiceClient.determineTicketPrice(seatTypeId, projectionType, showTime);
    }

    @Tool(description = "Tính giá vé cho một suất chiếu cụ thể khi người dùng nói tên loại ghế, ví dụ: VIP, ghế VIP, ghế thường, ghế đôi. Tool này tự resolve seatTypeId và để ticket-service tự xác định dayType bằng bảng Holiday và giờ chiếu. Dùng tool này thay vì getTicketPrices khi câu hỏi có ngày/giờ cụ thể như tối thứ 7 sau 17:00.")
    public List<TicketPriceToolResponse> determineTicketPrices(
            @ToolParam(description = "Tên loại ghế, ví dụ: VIP, ghế VIP, ghế thường, ghế đôi.")
            String seatTypeName,

            @ToolParam(description = "Định dạng chiếu: 2D, 3D hoặc IMAX. Nếu người dùng không nói rõ thì có thể để trống để trả về tất cả định dạng phù hợp.")
            String projectionType,

            @ToolParam(description = "Thời gian chiếu theo định dạng ISO datetime, ví dụ: 2026-05-16T19:30:00.")
            String showTime
    ) {
        return ticketServiceClient.determineTicketPrices(seatTypeName, projectionType, showTime);
    }
}