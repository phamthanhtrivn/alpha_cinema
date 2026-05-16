package com.movieticket.ai.tool;

import com.movieticket.ai.client.CinemaServiceClient;
import com.movieticket.ai.dto.tool.CinemaToolResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AlphaCinemaTool {
    private final CinemaServiceClient cinemaServiceClient;

    @Tool(description = "Lấy danh sách rạp hoặc chi nhánh của Alpha Cinema. Dùng khi người dùng hỏi Alpha Cinema có những chi nhánh nào hoặc muốn chọn rạp.")
    public List<CinemaToolResponse> getCinemas() {
        return cinemaServiceClient.getCinemas();
    }
}
