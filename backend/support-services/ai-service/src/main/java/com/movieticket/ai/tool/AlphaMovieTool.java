package com.movieticket.ai.tool;

import com.movieticket.ai.client.MovieServiceClient;
import com.movieticket.ai.dto.tool.AvailableSeatToolResponse;
import com.movieticket.ai.dto.tool.MovieDetailToolResponse;
import com.movieticket.ai.dto.tool.MovieRecommendationToolResponse;
import com.movieticket.ai.dto.tool.MovieScheduleDateToolResponse;
import com.movieticket.ai.dto.tool.MovieSearchToolResponse;
import com.movieticket.ai.dto.tool.MovieToolResponse;
import com.movieticket.ai.dto.tool.ShowtimeToolResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AlphaMovieTool {
    private final MovieServiceClient movieServiceClient;

    @Tool(description = "Lấy danh sách phim đang chiếu tại Alpha Cinema. Dùng khi người dùng hỏi hôm nay có phim gì hoặc Alpha Cinema có phim nào đang chiếu.")
    public List<MovieToolResponse> getNowShowingMovies() {
        return movieServiceClient.getNowShowingMovies();
    }

    @Tool(description = "Tìm phim theo tên, trạng thái NOW_SHOWING/UPCOMING, thể loại, phân loại tuổi, quốc gia, năm phát hành, định dạng chiếu hoặc loại dịch thuật.")
    public List<MovieSearchToolResponse> searchMovies(
            @ToolParam(description = "Tên phim hoặc một phần tên phim. Có thể để trống.")
            String movieName,

            @ToolParam(description = "Trạng thái phát hành: NOW_SHOWING hoặc UPCOMING. Có thể để trống.")
            String releaseStatus,

            @ToolParam(description = "Thể loại phim. Có thể để trống.")
            String genre,

            @ToolParam(description = "Phân loại tuổi, ví dụ: P, K, T13, T16, T18. Có thể để trống.")
            String ageRating,

            @ToolParam(description = "Quốc gia sản xuất. Có thể để trống.")
            String nationality,

            @ToolParam(description = "Năm phát hành. Có thể để trống.")
            Integer releaseYear,

            @ToolParam(description = "Định dạng chiếu: 2D, 3D hoặc IMAX. Có thể để trống.")
            String projectionType,

            @ToolParam(description = "Loại dịch thuật: SUBTITLES, VOICE_OVER hoặc DUBBING. Có thể để trống.")
            String translationType,

            @ToolParam(description = "Số phim tối đa cần lấy. Nếu người dùng không nói rõ thì dùng 12.")
            Integer limit
    ) {
        return movieServiceClient.searchMovies(
                movieName,
                releaseStatus,
                genre,
                ageRating,
                nationality,
                releaseYear,
                projectionType,
                translationType,
                limit
        );
    }

    @Tool(description = "Lấy chi tiết một phim, gồm mô tả, thời lượng, diễn viên, đạo diễn, thể loại, trailer, poster, banner, phân loại tuổi, quốc gia, năm phát hành và điểm đánh giá.")
    public MovieDetailToolResponse getMovieDetail(
            @ToolParam(description = "Mã phim movieId nếu đã biết. Có thể để trống nếu có movieName.")
            String movieId,

            @ToolParam(description = "Tên phim hoặc một phần tên phim nếu chưa biết movieId.")
            String movieName
    ) {
        return movieServiceClient.getMovieDetail(movieId, movieName);
    }

    @Tool(description = "Lấy các ngày có suất chiếu của một phim. Dùng khi người dùng hỏi phim này còn chiếu ngày nào hoặc có chiếu hôm nay/ngày mai/cuối tuần không.")
    public MovieScheduleDateToolResponse getAvailableShowDates(
            @ToolParam(description = "Mã phim movieId nếu đã biết. Có thể để trống nếu có movieName.")
            String movieId,

            @ToolParam(description = "Tên phim hoặc một phần tên phim nếu chưa biết movieId.")
            String movieName
    ) {
        return movieServiceClient.getAvailableShowDates(movieId, movieName);
    }

    @Tool(description = "Gợi ý phim đang chiếu theo sở thích và bối cảnh đặt vé, gồm thể loại, độ tuổi, định dạng chiếu, rạp, ngày và khoảng giờ.")
    public List<MovieRecommendationToolResponse> recommendMovies(
            @ToolParam(description = "Tên phim hoặc từ khóa. Có thể để trống.")
            String movieName,

            @ToolParam(description = "Thể loại mong muốn. Có thể để trống.")
            String genre,

            @ToolParam(description = "Phân loại tuổi mong muốn. Có thể để trống.")
            String ageRating,

            @ToolParam(description = "Định dạng chiếu mong muốn: 2D, 3D hoặc IMAX. Có thể để trống.")
            String projectionType,

            @ToolParam(description = "Loại dịch thuật mong muốn: SUBTITLES, VOICE_OVER hoặc DUBBING. Có thể để trống.")
            String translationType,

            @ToolParam(description = "Ngày muốn xem, định dạng yyyy-MM-dd hoặc dd/MM/yyyy. Có thể để trống.")
            String date,

            @ToolParam(description = "Tên rạp hoặc chi nhánh. Có thể để trống.")
            String cinemaName,

            @ToolParam(description = "Giờ bắt đầu tối thiểu, định dạng HH:mm. Có thể để trống.")
            String timeFrom,

            @ToolParam(description = "Giờ kết thúc tối đa, định dạng HH:mm. Có thể để trống.")
            String timeTo,

            @ToolParam(description = "Số phim tối đa cần gợi ý. Nếu người dùng không nói rõ thì dùng 5.")
            Integer limit
    ) {
        return movieServiceClient.recommendMovies(
                movieName,
                genre,
                ageRating,
                projectionType,
                translationType,
                parseOptionalDate(date),
                cinemaName,
                normalizeTime(timeFrom),
                normalizeTime(timeTo),
                limit
        );
    }

    @Tool(description = "Tìm suất chiếu theo một ngày cụ thể, tên phim, tên rạp và khoảng giờ.")
    public List<ShowtimeToolResponse> searchShowtimes(
            @ToolParam(description = "Tên phim. Có thể để trống nếu người dùng hỏi chung về suất chiếu trong ngày.")
            String movieName,

            @ToolParam(description = "Tên rạp hoặc chi nhánh. Có thể để trống.")
            String cinemaName,

            @ToolParam(description = "Ngày chiếu, định dạng yyyy-MM-dd hoặc dd/MM/yyyy. Nếu để trống thì dùng hôm nay.")
            String date,

            @ToolParam(description = "Giờ bắt đầu tối thiểu, định dạng HH:mm. Có thể để trống.")
            String timeFrom,

            @ToolParam(description = "Giờ kết thúc tối đa, định dạng HH:mm. Có thể để trống.")
            String timeTo
    ) {
        return movieServiceClient.searchShowtimes(
                movieName,
                cinemaName,
                parseDate(date),
                normalizeTime(timeFrom),
                normalizeTime(timeTo)
        );
    }

    @Tool(description = "Tìm suất chiếu theo khoảng ngày hoặc cả tháng. Dùng khi người dùng hỏi tháng này/tháng 5/tuần này/cuối tuần/từ ngày A đến ngày B có suất chiếu gì.")
    public List<ShowtimeToolResponse> searchShowtimesByDateRange(
            @ToolParam(description = "Tên phim hoặc một phần tên phim. Có thể để trống nếu người dùng hỏi tất cả suất chiếu.")
            String movieName,

            @ToolParam(description = "Tên rạp hoặc chi nhánh. Có thể để trống.")
            String cinemaName,

            @ToolParam(description = "Ngày bắt đầu, định dạng yyyy-MM-dd hoặc dd/MM/yyyy. Với câu hỏi như 'tháng 5', dùng ngày đầu tháng, ví dụ: 2026-05-01.")
            String startDate,

            @ToolParam(description = "Ngày kết thúc, định dạng yyyy-MM-dd hoặc dd/MM/yyyy. Với câu hỏi như 'tháng 5', dùng ngày cuối tháng, ví dụ: 2026-05-31.")
            String endDate,

            @ToolParam(description = "Giờ bắt đầu tối thiểu, định dạng HH:mm. Có thể để trống.")
            String timeFrom,

            @ToolParam(description = "Giờ kết thúc tối đa, định dạng HH:mm. Có thể để trống.")
            String timeTo,

            @ToolParam(description = "Số suất chiếu tối đa cần lấy. Nếu người dùng không nói rõ thì dùng 20.")
            Integer limit
    ) {
        return movieServiceClient.searchShowtimesByDateRange(
                movieName,
                cinemaName,
                parseDate(startDate),
                parseOptionalDate(endDate),
                normalizeTime(timeFrom),
                normalizeTime(timeTo),
                limit
        );
    }

    @Tool(description = "Lấy danh sách ghế còn trống của một suất chiếu theo showScheduleId.")
    public List<AvailableSeatToolResponse> getAvailableSeats(
            @ToolParam(description = "Mã suất chiếu showScheduleId lấy từ kết quả searchShowtimes hoặc searchShowtimesByDateRange.")
            String showScheduleId
    ) {
        return movieServiceClient.getAvailableSeats(showScheduleId);
    }

    private LocalDate parseDate(String date) {
        if (!StringUtils.hasText(date)) {
            return LocalDate.now();
        }

        LocalDate parsedDate = parseOptionalDate(date);
        return parsedDate == null ? LocalDate.now() : parsedDate;
    }

    private LocalDate parseOptionalDate(String date) {
        if (!StringUtils.hasText(date)) {
            return null;
        }

        try {
            return LocalDate.parse(date.trim());
        } catch (Exception ignored) {
            try {
                return LocalDate.parse(date.trim(), DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } catch (Exception ignoredAgain) {
                return null;
            }
        }
    }

    private String normalizeTime(String time) {
        if (!StringUtils.hasText(time)) {
            return null;
        }
        return time.trim();
    }
}