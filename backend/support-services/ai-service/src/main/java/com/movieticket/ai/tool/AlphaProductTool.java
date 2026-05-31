package com.movieticket.ai.tool;

import com.movieticket.ai.client.ProductServiceClient;
import com.movieticket.ai.dto.tool.ProductToolResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AlphaProductTool {
    private final ProductServiceClient productServiceClient;

        @Tool(description = "Lấy danh sách sản phẩm đồ ăn, nước uống và combo đang bán tại Alpha Cinema. Dùng khi khách hỏi có sản phẩm, bắp nước hoặc combo nào và giá bao nhiêu.")
        public List<ProductToolResponse> getProducts(
            @ToolParam(description = "Tên sản phẩm hoặc một phần tên sản phẩm. Có thể để trống.")
            String productName,

            @ToolParam(description = "Loại sản phẩm: SINGLE hoặc COMBO. Không nói rõ thì lấy hết. Có thể để trống.")
            String productType,

            @ToolParam(description = "Số sản phẩm tối đa cần lấy. Nếu khách không nói rõ thì dùng 12.")
            Integer limit
    ) {
        return productServiceClient.getProducts(productName, productType, limit);
    }
}
