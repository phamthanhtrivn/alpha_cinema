package com.movieticket.ai.service;

import com.movieticket.ai.dto.response.ChatActionResponse;
import com.movieticket.ai.dto.tool.MovieDetailToolResponse;
import com.movieticket.ai.dto.tool.ShowtimeToolResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MovieBookingActionService {
    private static final DateTimeFormatter ACTION_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM HH:mm");

    public List<ChatActionResponse> buildMovieDetailActions(MovieDetailToolResponse movie) {
        if (movie == null || !StringUtils.hasText(movie.movieId())) {
            return List.of();
        }

        return buildMovieShowtimeActions(movie.movieId(), movie.movieName());
    }

    public List<ChatActionResponse> buildMovieShowtimeActions(String movieId, String movieName) {
        if (!StringUtils.hasText(movieId)) {
            return List.of();
        }

        return List.of(new ChatActionResponse(
                "VIEW_MOVIE_SHOWTIMES",
                "Xem lịch chiếu",
                "/movie/" + encodePath(movieId) + "#showtimes",
                movieId,
                null,
                movieName
        ));
    }

    public List<ChatActionResponse> buildShowtimeActions(List<ShowtimeToolResponse> showtimes) {
        if (showtimes == null || showtimes.isEmpty()) {
            return List.of();
        }

        return showtimes.stream()
                .filter(this::hasBookingTarget)
                .map(this::toBookingAction)
                .toList();
    }

    public List<ChatActionResponse> buildShowtimeActions(ShowtimeToolResponse showtime) {
        return showtime == null ? List.of() : buildShowtimeActions(List.of(showtime));
    }

    public List<ChatActionResponse> buildMovieDetailViewActions(String movieId, String movieName) {
        if (!StringUtils.hasText(movieId)) {
            return List.of();
        }

        return List.of(new ChatActionResponse(
                "VIEW_MOVIE_DETAIL",
                "Xem chi tiết",
                "/movie/" + encodePath(movieId),
                movieId,
                null,
                movieName
        ));
    }

    private boolean hasBookingTarget(ShowtimeToolResponse showtime) {
        return showtime != null
                && StringUtils.hasText(showtime.showScheduleId())
                && StringUtils.hasText(showtime.movieId())
                && showtime.startTime() != null;
    }

    private ChatActionResponse toBookingAction(ShowtimeToolResponse showtime) {
        String cinemaLabel = StringUtils.hasText(showtime.cinemaName())
                ? " - " + showtime.cinemaName()
                : "";

        return new ChatActionResponse(
                "SELECT_SHOWTIME_SEATS",
                "Chọn ghế " + showtime.startTime().format(ACTION_TIME_FORMAT) + cinemaLabel,
                "/booking/" + encodePath(showtime.showScheduleId()) + "?movieId=" + encodeQuery(showtime.movieId()),
                showtime.movieId(),
                showtime.showScheduleId(),
                showtime.cinemaName()
        );
    }

    private String encodePath(String value) {
        return UriUtils.encodePathSegment(value, StandardCharsets.UTF_8);
    }

    private String encodeQuery(String value) {
        return UriUtils.encodeQueryParam(value, StandardCharsets.UTF_8);
    }
}
