package com.movieticket.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.movieticket.ai.config.AiToolProperties;
import com.movieticket.ai.dto.tool.AvailableSeatToolResponse;
import com.movieticket.ai.dto.tool.CinemaToolResponse;
import com.movieticket.ai.dto.tool.MovieDetailToolResponse;
import com.movieticket.ai.dto.tool.MovieRecommendationResultToolResponse;
import com.movieticket.ai.dto.tool.MovieRecommendationToolResponse;
import com.movieticket.ai.dto.tool.MovieScheduleDateToolResponse;
import com.movieticket.ai.dto.tool.MovieSearchToolResponse;
import com.movieticket.ai.dto.tool.MovieToolResponse;
import com.movieticket.ai.dto.tool.ShowtimeToolResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
@CircuitBreaker(name = "movieService")
@Retry(name = "movieService")
public class MovieServiceClient {
    private static final int MAX_MOVIES = 12;
    private static final int MAX_SHOWTIMES = 20;
    private static final int MAX_SEATS = 80;

    private final WebClient movieWebClient;
    private final CinemaServiceClient cinemaServiceClient;
    private final Duration timeout;

    public MovieServiceClient(
            @Qualifier("movieWebClient") WebClient movieWebClient,
            CinemaServiceClient cinemaServiceClient,
            AiToolProperties toolProperties
    ) {
        this.movieWebClient = movieWebClient;
        this.cinemaServiceClient = cinemaServiceClient;
        this.timeout = Duration.ofMillis(toolProperties.safeTimeoutMs());
    }

    public List<MovieToolResponse> getNowShowingMovies() {
        return fetchMovies(null, "NOW_SHOWING", null, null, null, null, null, null, MAX_MOVIES)
                .stream()
                .map(movie -> new MovieToolResponse(
                        movie.id(),
                        movie.title(),
                        null,
                        null,
                        movie.ageType(),
                        "NOW_SHOWING"
                ))
                .toList();
    }

    public List<MovieSearchToolResponse> searchMovies(
            String movieName,
            String releaseStatus,
            String genre,
            String ageRating,
            String nationality,
            Integer releaseYear,
            String projectionType,
            String translationType,
            Integer limit
    ) {
        String effectiveStatus = normalizeReleaseStatus(releaseStatus);
        int effectiveLimit = safeLimit(limit, MAX_MOVIES);

        return fetchMovies(
                movieName,
                effectiveStatus,
                genre,
                null,
                nationality,
                releaseYear,
                projectionType,
                translationType,
                effectiveLimit
        ).stream()
                .filter(movie -> matchesText(ageRating, movie.ageType()))
                .limit(effectiveLimit)
                .map(movie -> toMovieSearchResponse(movie, effectiveStatus))
                .toList();
    }

    public MovieDetailToolResponse getMovieDetail(String movieId, String movieName) {
        MoviePublicApiResponse movie = resolveMovie(movieId, movieName);
        if (movie == null || !StringUtils.hasText(movie.id())) {
            return null;
        }

        ApiEnvelope<MovieDetailApiResponse> response = call(
                "getMovieDetail",
                "movie-service",
                "movieId=" + safeForLog(movie.id()),
                movieWebClient.get()
                        .uri("/api/movies/public/{movieId}", movie.id())
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<MovieDetailApiResponse>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return null;
        }

        return toMovieDetailResponse(response.data());
    }

    public MovieScheduleDateToolResponse getAvailableShowDates(String movieId, String movieName) {
        MoviePublicApiResponse movie = resolveMovie(movieId, movieName);
        if (movie == null || !StringUtils.hasText(movie.id())) {
            return null;
        }

        ApiEnvelope<List<LocalDate>> response = call(
                "getAvailableShowDates",
                "movie-service",
                "movieId=" + safeForLog(movie.id()),
                movieWebClient.get()
                        .uri("/api/show-schedules/public/get-available-dates/{movieId}", movie.id())
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<LocalDate>>>() {
                        })
        );

        return new MovieScheduleDateToolResponse(
                movie.id(),
                movie.title(),
                response == null || response.data() == null ? List.of() : response.data()
        );
    }

    public MovieRecommendationResultToolResponse recommendMovies(
            String movieName,
            List<String> genres,
            String genreMatchMode,
            String ageRating,
            String nationality,
            String projectionType,
            String translationType,
            LocalDate date,
            String cinemaName,
            String timeFrom,
            String timeTo,
            Integer limit
    ) {
        int effectiveLimit = safeLimit(limit, 5);
        List<String> normalizedGenres = MoviePreferenceNormalizer.normalizeGenres(genres);
        String normalizedMatchMode = MoviePreferenceNormalizer.normalizeGenreMatchMode(genreMatchMode, genres);
        String normalizedNationality = MoviePreferenceNormalizer.normalizeNationality(nationality);
        LocalTime from = parseTime(timeFrom);
        LocalTime to = parseTime(timeTo);

        if ((StringUtils.hasText(cinemaName) || StringUtils.hasText(timeFrom) || StringUtils.hasText(timeTo))
                && date == null) {
            return recommendationResult(
                    List.of(),
                    normalizedGenres,
                    normalizedMatchMode,
                    null,
                    false,
                    false,
                    true,
                    "Vui lòng cung cấp ngày muốn xem để lọc chính xác theo rạp hoặc khung giờ."
            );
        }

        if ((StringUtils.hasText(timeFrom) && from == null) || (StringUtils.hasText(timeTo) && to == null)) {
            return recommendationResult(
                    List.of(),
                    normalizedGenres,
                    normalizedMatchMode,
                    null,
                    false,
                    false,
                    true,
                    "Khung giờ chưa hợp lệ. Vui lòng dùng định dạng HH:mm."
            );
        }

        List<MovieRecommendationToolResponse> recommendations = recommendMovies(
                movieName, normalizedGenres, normalizedMatchMode, ageRating, normalizedNationality,
                projectionType, translationType, date, cinemaName, from, to, effectiveLimit, "NOW_SHOWING"
        );
        if (!recommendations.isEmpty()) {
            return recommendationResult(
                    recommendations, normalizedGenres, normalizedMatchMode, "NOW_SHOWING",
                    false, false, false, "Đã tìm thấy phim đang chiếu phù hợp."
            );
        }

        recommendations = recommendMovies(
                movieName, normalizedGenres, normalizedMatchMode, ageRating, normalizedNationality,
                projectionType, translationType, date, cinemaName, from, to, effectiveLimit, "UPCOMING"
        );
        if (!recommendations.isEmpty()) {
            return recommendationResult(
                    recommendations, normalizedGenres, normalizedMatchMode, "UPCOMING",
                    true, false, false, "Hiện chưa có phim đang chiếu phù hợp; đây là các phim sắp chiếu khớp sở thích."
            );
        }

        if ("ALL".equals(normalizedMatchMode) && normalizedGenres.size() > 1) {
            recommendations = recommendMovies(
                    movieName, normalizedGenres, "ANY", ageRating, normalizedNationality,
                    projectionType, translationType, date, cinemaName, from, to, effectiveLimit, "NOW_SHOWING"
            );
            if (!recommendations.isEmpty()) {
                return recommendationResult(
                        recommendations, normalizedGenres, "ANY", "NOW_SHOWING",
                        false, true, false, "Chưa có phim khớp toàn bộ thể loại; đây là các phim đang chiếu gần nhất với sở thích."
                );
            }

            recommendations = recommendMovies(
                    movieName, normalizedGenres, "ANY", ageRating, normalizedNationality,
                    projectionType, translationType, date, cinemaName, from, to, effectiveLimit, "UPCOMING"
            );
            if (!recommendations.isEmpty()) {
                return recommendationResult(
                        recommendations, normalizedGenres, "ANY", "UPCOMING",
                        true, true, false, "Chưa có phim khớp toàn bộ thể loại; đây là các phim sắp chiếu gần nhất với sở thích."
                );
            }
        }

        return recommendationResult(
                List.of(), normalizedGenres, normalizedMatchMode, null,
                false, false, false, "Hiện chưa tìm thấy phim phù hợp với sở thích."
        );
    }

    private List<MovieRecommendationToolResponse> recommendMovies(
            String movieName,
            List<String> genres,
            String genreMatchMode,
            String ageRating,
            String nationality,
            String projectionType,
            String translationType,
            LocalDate date,
            String cinemaName,
            LocalTime from,
            LocalTime to,
            int limit,
            String releaseStatus
    ) {
        return fetchMovies(
                movieName,
                releaseStatus,
                genres,
                genreMatchMode,
                null,
                nationality,
                null,
                projectionType,
                translationType,
                Math.max(limit * 2, MAX_MOVIES)
        ).stream()
                .filter(movie -> matchesText(ageRating, movie.ageType()))
                .map(movie -> toRecommendation(movie, releaseStatus, date, cinemaName, from, to))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(MovieRecommendationToolResponse::avgRating,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .toList();
    }

    public List<ShowtimeToolResponse> searchShowtimes(
            String movieName,
            String cinemaName,
            LocalDate date,
            String timeFrom,
            String timeTo
    ) {
        LocalDate effectiveDate = date == null ? LocalDate.now() : date;
        List<MoviePublicApiResponse> movies = searchMovies(movieName);
        if (movies.isEmpty()) {
            return List.of();
        }

        LocalTime from = parseTime(timeFrom);
        LocalTime to = parseTime(timeTo);

        return movies.stream()
                .flatMap(movie -> searchSchedules(movie.id(), effectiveDate).stream()
                        .filter(cinema -> matchesCinemaName(cinemaName, cinema))
                        .flatMap(cinema -> toShowtimeResponses(movie, cinema).stream()))
                .filter(Objects::nonNull)
                .filter(showtime -> withinTimeRange(showtime.startTime(), from, to))
                .limit(MAX_SHOWTIMES)
                .toList();
    }

    public List<ShowtimeToolResponse> searchShowtimesByDateRange(
            String movieName,
            String cinemaName,
            LocalDate startDate,
            LocalDate endDate,
            String timeFrom,
            String timeTo,
            Integer limit
    ) {
        LocalDate effectiveStartDate = startDate == null ? LocalDate.now() : startDate;
        LocalDate effectiveEndDate = endDate == null ? effectiveStartDate : endDate;
        int safeLimit = safeLimit(limit, MAX_SHOWTIMES);
        LocalTime from = parseTime(timeFrom);
        LocalTime to = parseTime(timeTo);
        List<CinemaToolResponse> cinemas = cinemaServiceClient.getCinemas();
        Map<String, CinemaToolResponse> cinemaById = cinemas.stream()
                .collect(Collectors.toMap(CinemaToolResponse::cinemaId, Function.identity(), (left, right) -> left));
        List<String> cinemaIds = resolveCinemaIds(cinemaName, cinemas);

        if (cinemaIds.isEmpty() && StringUtils.hasText(cinemaName)) {
            return List.of();
        }

        List<ShowtimeToolResponse> showtimes;
        if (cinemaIds.isEmpty()) {
            showtimes = searchScheduleRange(movieName, null, effectiveStartDate, effectiveEndDate, safeLimit, cinemaById);
        } else {
            showtimes = cinemaIds.stream()
                    .flatMap(cinemaId -> searchScheduleRange(movieName, cinemaId, effectiveStartDate, effectiveEndDate, safeLimit, cinemaById).stream())
                    .toList();
        }

        return showtimes.stream()
                .filter(showtime -> withinTimeRange(showtime.startTime(), from, to))
                .limit(safeLimit)
                .toList();
    }

    public List<AvailableSeatToolResponse> getAvailableSeats(String showScheduleId) {
        if (!StringUtils.hasText(showScheduleId)) {
            return List.of();
        }

        ApiEnvelope<BookingLayoutApiResponse> response = call(
                "getAvailableSeats",
                "movie-service",
                "showScheduleId=" + showScheduleId,
                movieWebClient.get()
                        .uri("/api/show-schedules/booking-layout/{showScheduleId}", showScheduleId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<BookingLayoutApiResponse>>() {
                        })
        );

        if (response == null || response.data() == null || response.data().seats() == null) {
            return List.of();
        }

        return response.data().seats().stream()
                .filter(seat -> "AVAILABLE".equalsIgnoreCase(seat.status()))
                .limit(MAX_SEATS)
                .map(seat -> new AvailableSeatToolResponse(
                        seat.seatId(),
                        buildSeatCode(seat.rowName(), seat.columnName()),
                        seat.seatType(),
                        null,
                        true
                ))
                .toList();
    }

    public ShowtimeToolResponse getShowtime(String showScheduleId) {
        if (!StringUtils.hasText(showScheduleId)) {
            return null;
        }

        ApiEnvelope<ShowScheduleLookupApiResponse> response = call(
                "getShowtime",
                "movie-service",
                "showScheduleId=" + showScheduleId,
                movieWebClient.get()
                        .uri("/api/show-schedules/{showScheduleId}", showScheduleId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<ShowScheduleLookupApiResponse>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return null;
        }

        ShowScheduleLookupApiResponse schedule = response.data();
        String cinemaName = cinemaServiceClient.getCinemas().stream()
                .filter(cinema -> Objects.equals(cinema.cinemaId(), schedule.cinemaId()))
                .map(CinemaToolResponse::cinemaName)
                .findFirst()
                .orElse(schedule.cinemaId());

        return new ShowtimeToolResponse(
                schedule.id(),
                schedule.movieId(),
                schedule.movieTitle(),
                cinemaName,
                schedule.cinemaId(),
                null,
                schedule.projectionType(),
                schedule.translationType(),
                schedule.startTime(),
                schedule.endTime(),
                null,
                null
        );
    }

    private List<MoviePublicApiResponse> searchMovies(String movieName) {
        return fetchMovies(movieName, "NOW_SHOWING", null, null, null, null, null, null,
                StringUtils.hasText(movieName) ? 5 : MAX_MOVIES);
    }

    private List<MoviePublicApiResponse> fetchMovies(
            String movieName,
            String releaseStatus,
            String genre,
            String ageTypeId,
            String nationality,
            Integer releaseYear,
            String projectionType,
            String translationType,
            int limit
    ) {
        return fetchMovies(
                movieName,
                releaseStatus,
                StringUtils.hasText(genre) ? List.of(genre) : List.of(),
                "ANY",
                ageTypeId,
                nationality,
                releaseYear,
                projectionType,
                translationType,
                limit
        );
    }

    private List<MoviePublicApiResponse> fetchMovies(
            String movieName,
            String releaseStatus,
            List<String> genres,
            String genreMatchMode,
            String ageTypeId,
            String nationality,
            Integer releaseYear,
            String projectionType,
            String translationType,
            int limit
    ) {
        ApiEnvelope<PageEnvelope<MoviePublicApiResponse>> response = call(
                "searchMovies",
                "movie-service",
                "movieName=" + safeForLog(movieName) + ", releaseStatus=" + safeForLog(releaseStatus),
                movieWebClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path("/api/movies/public")
                                    .queryParam("page", 0)
                                    .queryParam("size", limit);
                            if (StringUtils.hasText(releaseStatus)) {
                                builder.queryParam("releaseStatus", releaseStatus);
                            }
                            if (StringUtils.hasText(movieName)) {
                                builder.queryParam("title", movieName);
                            }
                            if (genres != null && !genres.isEmpty()) {
                                builder.queryParam("genres", genres.toArray());
                                builder.queryParam("genreMatchMode", genreMatchMode);
                            }
                            if (StringUtils.hasText(ageTypeId)) {
                                builder.queryParam("ageTypeId", ageTypeId);
                            }
                            if (StringUtils.hasText(nationality)) {
                                builder.queryParam("nationality", nationality);
                            }
                            if (releaseYear != null) {
                                builder.queryParam("releaseYear", releaseYear);
                            }
                            if (StringUtils.hasText(projectionType)) {
                                builder.queryParam("projectionType", normalizeProjectionType(projectionType));
                            }
                            if (StringUtils.hasText(translationType)) {
                                builder.queryParam("translationType", normalizeTranslationType(translationType));
                            }
                            return builder.build();
                        })
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<PageEnvelope<MoviePublicApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null || response.data().content() == null) {
            return List.of();
        }

        return response.data().content();
    }

    private MoviePublicApiResponse resolveMovie(String movieId, String movieName) {
        if (StringUtils.hasText(movieId)) {
            return new MoviePublicApiResponse(movieId.trim(), null, null, null, null, null, null, null);
        }

        return searchMovies(movieName).stream()
                .findFirst()
                .orElse(null);
    }

    private MovieSearchToolResponse toMovieSearchResponse(MoviePublicApiResponse movie, String status) {
        return new MovieSearchToolResponse(
                movie.id(),
                movie.title(),
                movie.ageType(),
                movie.avgRating(),
                movie.premiereDate(),
                movie.trailerUrl(),
                movie.thumbnailUrl(),
                movie.bannerUrl(),
                status
        );
    }

    private MovieDetailToolResponse toMovieDetailResponse(MovieDetailApiResponse movie) {
        return new MovieDetailToolResponse(
                movie.id(),
                movie.title(),
                movie.duration(),
                movie.avgRating(),
                movie.premiereDate(),
                movie.producer(),
                movie.description(),
                movie.trailerUrl(),
                movie.thumbnailUrl(),
                movie.bannerUrl(),
                movie.ageType(),
                movie.releaseYear(),
                movie.nationality(),
                safeList(movie.genre()),
                toArtistNames(movie.actors()),
                toArtistNames(movie.directors())
        );
    }

    private MovieRecommendationToolResponse toRecommendation(
            MoviePublicApiResponse movie,
            String releaseStatus,
            LocalDate date,
            String cinemaName,
            LocalTime from,
            LocalTime to
    ) {
        List<ShowtimeToolResponse> showtimes = List.of();
        if (date != null) {
            showtimes = searchSchedules(movie.id(), date).stream()
                    .filter(cinema -> matchesCinemaName(cinemaName, cinema))
                    .flatMap(cinema -> toShowtimeResponses(movie, cinema).stream())
                    .filter(showtime -> withinTimeRange(showtime.startTime(), from, to))
                    .toList();

            if (showtimes.isEmpty()) {
                return null;
            }
        }

        return new MovieRecommendationToolResponse(
                movie.id(),
                movie.title(),
                movie.ageType(),
                movie.avgRating(),
                movie.premiereDate(),
                movie.thumbnailUrl(),
                movie.bannerUrl(),
                releaseStatus,
                date == null ? null : showtimes.size(),
                showtimes.stream().limit(3).toList()
        );
    }

    private List<ShowtimeToolResponse> searchScheduleRange(
            String movieName,
            String cinemaId,
            LocalDate startDate,
            LocalDate endDate,
            int limit,
            Map<String, CinemaToolResponse> cinemaById
    ) {
        ApiEnvelope<List<ShowScheduleRangeApiResponse>> response = call(
                "searchShowtimesByDateRange",
                "movie-service",
                "movieName=" + safeForLog(movieName) + ", cinemaId=" + safeForLog(cinemaId)
                        + ", startDate=" + startDate + ", endDate=" + endDate,
                movieWebClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path("/api/show-schedules/public/search")
                                    .queryParam("startDate", startDate)
                                    .queryParam("endDate", endDate)
                                    .queryParam("limit", limit);
                            if (StringUtils.hasText(movieName)) {
                                builder.queryParam("movieTitle", movieName);
                            }
                            if (StringUtils.hasText(cinemaId)) {
                                builder.queryParam("cinemaId", cinemaId);
                            }
                            return builder.build();
                        })
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<ShowScheduleRangeApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        return response.data().stream()
                .map(schedule -> toShowtimeResponse(schedule, cinemaById))
                .filter(Objects::nonNull)
                .toList();
    }

    private List<CinemaShowtimeApiResponse> searchSchedules(String movieId, LocalDate date) {
        ApiEnvelope<List<CinemaShowtimeApiResponse>> response = call(
                "searchShowtimes",
                "movie-service",
                "movieId=" + safeForLog(movieId) + ", date=" + date,
                movieWebClient.get()
                        .uri(uriBuilder -> uriBuilder
                                    .path("/api/show-schedules/public/find-by-movie/{movieId}")
                                    .queryParam("date", date)
                                    .build(movieId))
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<ApiEnvelope<List<CinemaShowtimeApiResponse>>>() {
                        })
        );

        if (response == null || response.data() == null) {
            return List.of();
        }

        return response.data();
    }

    private ShowtimeToolResponse toShowtimeResponse(
            ShowScheduleRangeApiResponse schedule,
            Map<String, CinemaToolResponse> cinemaById
    ) {
        if (schedule == null || schedule.id() == null || schedule.startTime() == null) {
            return null;
        }

        CinemaToolResponse cinema = cinemaById.get(schedule.cinemaId());
        return new ShowtimeToolResponse(
                schedule.id(),
                schedule.movieId(),
                schedule.movieTitle(),
                cinema == null ? schedule.cinemaId() : cinema.cinemaName(),
                schedule.cinemaId(),
                null,
                schedule.projectionType(),
                schedule.translationType(),
                schedule.startTime(),
                schedule.endTime(),
                schedule.availableSeat(),
                null
        );
    }

    private List<ShowtimeToolResponse> toShowtimeResponses(
            MoviePublicApiResponse movie,
            CinemaShowtimeApiResponse cinema
    ) {
        if (cinema == null || cinema.formats() == null) {
            return List.of();
        }

        return cinema.formats().stream()
                .filter(format -> format.showTimes() != null)
                .flatMap(format -> format.showTimes().stream()
                        .map(showtime -> toShowtimeResponse(movie, cinema, format, showtime)))
                .filter(Objects::nonNull)
                .toList();
    }

    private ShowtimeToolResponse toShowtimeResponse(
            MoviePublicApiResponse movie,
            CinemaShowtimeApiResponse cinema,
            FormatShowtimeApiResponse format,
            ShowtimeApiResponse showtime
    ) {
        if (showtime == null || showtime.id() == null || showtime.time() == null) {
            return null;
        }

        return new ShowtimeToolResponse(
                showtime.id(),
                movie.id(),
                movie.title(),
                firstNonBlank(cinema.cinemaName(), cinema.cinemaId()),
                cinema.cinemaId(),
                null,
                format == null ? null : format.projection(),
                format == null ? null : format.translation(),
                showtime.time(),
                null,
                null,
                null
        );
    }

    private boolean matchesCinemaName(String cinemaName, CinemaShowtimeApiResponse cinema) {
        if (!StringUtils.hasText(cinemaName)) {
            return true;
        }

        if (cinema == null || !StringUtils.hasText(cinema.cinemaName())) {
            return false;
        }
        String normalizedName = MoviePreferenceNormalizer.normalizeSearchText(cinemaName);
        return MoviePreferenceNormalizer.normalizeSearchText(cinema.cinemaName()).contains(normalizedName);
    }

    private List<String> resolveCinemaIds(String cinemaName, List<CinemaToolResponse> cinemas) {
        if (!StringUtils.hasText(cinemaName)) {
            return List.of();
        }

        String normalizedName = MoviePreferenceNormalizer.normalizeSearchText(cinemaName);
        return cinemas.stream()
                .filter(cinema -> cinema.cinemaName() != null
                        && MoviePreferenceNormalizer.normalizeSearchText(cinema.cinemaName()).contains(normalizedName))
                .map(CinemaToolResponse::cinemaId)
                .toList();
    }

    private boolean withinTimeRange(LocalDateTime startTime, LocalTime from, LocalTime to) {
        if (startTime == null) {
            return false;
        }
        LocalTime time = startTime.toLocalTime();
        return (from == null || !time.isBefore(from)) && (to == null || !time.isAfter(to));
    }

    private LocalTime parseTime(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalTime.parse(value.trim());
        } catch (Exception ex) {
            log.warn("AI tool searchShowtimes ignored invalid time value");
            return null;
        }
    }

    private String buildSeatCode(String rowName, String columnName) {
        return firstNonBlank(rowName, "") + firstNonBlank(columnName, "");
    }

    private String firstNonBlank(String first, String second) {
        return StringUtils.hasText(first) ? first : second;
    }

    private boolean matchesText(String expected, String actual) {
        if (!StringUtils.hasText(expected)) {
            return true;
        }
        return actual != null && actual.toLowerCase().contains(expected.trim().toLowerCase());
    }

    private int safeLimit(Integer limit, int defaultLimit) {
        if (limit == null || limit <= 0) {
            return defaultLimit;
        }
        return Math.min(limit, MAX_SHOWTIMES);
    }

    private String normalizeProjectionType(String value) {
        String normalized = value.trim().toUpperCase();
        return switch (normalized) {
            case "2D" -> "_2D";
            case "3D" -> "_3D";
            default -> normalized;
        };
    }

    private String normalizeReleaseStatus(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        return switch (normalized) {
            case "NOW", "NOW_SHOWING", "DANG_CHIEU", "DANG CHIEU" -> "NOW_SHOWING";
            case "UPCOMING", "COMING_SOON", "SAP_CHIEU", "SAP CHIEU" -> "UPCOMING";
            default -> normalized;
        };
    }

    private String normalizeTranslationType(String value) {
        String normalized = value.trim().toUpperCase();
        return switch (normalized) {
            case "SUBTITLE", "PHU_DE" -> "SUBTITLES";
            case "VOICEOVER", "THUYET_MINH" -> "VOICE_OVER";
            default -> normalized;
        };
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }

    private List<String> toArtistNames(List<ArtistApiResponse> artists) {
        if (artists == null) {
            return List.of();
        }
        return artists.stream()
                .map(ArtistApiResponse::fullName)
                .filter(StringUtils::hasText)
                .toList();
    }

    private String safeForLog(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }

    private <T> T call(String toolName, String serviceName, String params, reactor.core.publisher.Mono<T> mono) {
        try {
            return mono.timeout(timeout).block(timeout.plusMillis(500));
        } catch (Exception ex) {
            log.warn("AI tool {} failed calling {} with params [{}]: {}", toolName, serviceName, params, ex.getMessage());
            return null;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record MoviePublicApiResponse(
            String id,
            String title,
            String trailerUrl,
            LocalDate premiereDate,
            String thumbnailUrl,
            String bannerUrl,
            String ageType,
            Double avgRating
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record MovieDetailApiResponse(
            String id,
            String title,
            Integer duration,
            Double avgRating,
            LocalDate premiereDate,
            String producer,
            String description,
            String trailerUrl,
            String thumbnailUrl,
            String bannerUrl,
            String ageType,
            Integer releaseYear,
            String nationality,
            List<String> genre,
            List<ArtistApiResponse> actors,
            List<ArtistApiResponse> directors
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ArtistApiResponse(
            String id,
            String fullName
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ShowScheduleRangeApiResponse(
            String id,
            String movieId,
            String movieTitle,
            String cinemaId,
            String projectionType,
            String translationType,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer availableSeat
    ) {
    }

    private MovieRecommendationResultToolResponse recommendationResult(
            List<MovieRecommendationToolResponse> recommendations,
            List<String> requestedGenres,
            String appliedGenreMatchMode,
            String resultReleaseStatus,
            boolean upcomingFallback,
            boolean genreMatchRelaxed,
            boolean needsClarification,
            String message
    ) {
        return new MovieRecommendationResultToolResponse(
                recommendations,
                requestedGenres,
                appliedGenreMatchMode,
                resultReleaseStatus,
                upcomingFallback,
                genreMatchRelaxed,
                needsClarification,
                message
        );
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ShowScheduleLookupApiResponse(
            String id,
            String movieId,
            String movieTitle,
            String cinemaId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String projectionType,
            String translationType
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CinemaShowtimeApiResponse(
            String cinemaId,
            String cinemaName,
            List<FormatShowtimeApiResponse> formats
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FormatShowtimeApiResponse(
            String projection,
            String translation,
            List<ShowtimeApiResponse> showTimes
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ShowtimeApiResponse(
            String id,
            LocalDateTime time
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record BookingLayoutApiResponse(
            String cinemaName,
            String roomName,
            List<SeatApiResponse> seats
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record SeatApiResponse(
            String seatId,
            String rowName,
            String columnName,
            String seatType,
            String status
    ) {
    }
}
