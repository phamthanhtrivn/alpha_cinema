package com.movieticket.ai.client;

import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

final class MoviePreferenceNormalizer {
    private static final Map<String, String> GENRE_BY_ALIAS = buildGenreAliases();
    private static final Map<String, String> NATIONALITY_BY_ALIAS = Map.ofEntries(
            Map.entry("han", "South Korea"),
            Map.entry("han quoc", "South Korea"),
            Map.entry("korean", "South Korea"),
            Map.entry("south korea", "South Korea"),
            Map.entry("viet", "Vietnam"),
            Map.entry("viet nam", "Vietnam"),
            Map.entry("vietnam", "Vietnam"),
            Map.entry("vietnamese", "Vietnam"),
            Map.entry("my", "USA"),
            Map.entry("hoa ky", "USA"),
            Map.entry("american", "USA"),
            Map.entry("usa", "USA")
    );

    private MoviePreferenceNormalizer() {
    }

    static List<String> normalizeGenres(List<String> genres) {
        if (genres == null || genres.isEmpty()) {
            return List.of();
        }

        LinkedHashSet<String> normalizedGenres = new LinkedHashSet<>();
        genres.stream()
                .filter(StringUtils::hasText)
                .flatMap(genre -> splitGenres(genre).stream())
                .map(MoviePreferenceNormalizer::normalizeGenre)
                .filter(StringUtils::hasText)
                .forEach(normalizedGenres::add);
        return List.copyOf(normalizedGenres);
    }

    static String normalizeGenreMatchMode(String genreMatchMode, List<String> rawGenres) {
        if (StringUtils.hasText(genreMatchMode)) {
            return "ALL".equalsIgnoreCase(genreMatchMode.trim()) ? "ALL" : "ANY";
        }

        String combinedGenres = normalizeSearchText(String.join(" ", rawGenres == null ? List.of() : rawGenres));
        return combinedGenres.matches(".*\\b(?:va|pha)\\b.*") ? "ALL" : "ANY";
    }

    static String normalizeNationality(String nationality) {
        if (!StringUtils.hasText(nationality)) {
            return null;
        }

        String normalized = normalizeSearchText(nationality)
                .replaceFirst("^phim\\s+", "")
                .trim();
        return NATIONALITY_BY_ALIAS.getOrDefault(normalized, nationality.trim());
    }

    static String normalizeSearchText(String value) {
        if (value == null) {
            return "";
        }

        String withoutAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');
        return withoutAccents
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static List<String> splitGenres(String value) {
        String normalized = normalizeSearchText(value);
        if (!normalized.matches(".*\\b(?:hoac|va|pha)\\b.*")) {
            return List.of(value);
        }

        List<String> genres = new ArrayList<>();
        for (String genre : normalized.split("\\s+(?:hoac|va|pha)\\s+")) {
            if (!genre.isBlank()) {
                genres.add(genre);
            }
        }
        return genres;
    }

    private static String normalizeGenre(String genre) {
        String normalized = normalizeSearchText(genre)
                .replaceFirst("^phim\\s+", "")
                .replaceFirst("^the loai\\s+", "")
                .trim();
        return GENRE_BY_ALIAS.getOrDefault(normalized, genre.trim());
    }

    private static Map<String, String> buildGenreAliases() {
        java.util.LinkedHashMap<String, String> genres = new java.util.LinkedHashMap<>();
        register(genres, "Hành động", "action", "hanh dong");
        register(genres, "Kinh dị", "horror", "kinh di", "ma");
        register(genres, "Tình cảm", "romance", "tinh cam", "lang man");
        register(genres, "Hài hước", "comedy", "hai huoc", "hai", "vui", "vui vui");
        register(genres, "Viễn tưởng", "sci fi", "science fiction", "vien tuong");
        register(genres, "Giả tưởng", "fantasy", "gia tuong");
        register(genres, "Phiêu lưu", "adventure", "phieu luu");
        register(genres, "Drama", "drama", "chinh kich", "tam ly");
        register(genres, "Thriller", "thriller", "giat gan");
        register(genres, "Biography", "biography", "tieu su");
        register(genres, "History", "history", "lich su");
        register(genres, "Crime", "crime", "toi pham");
        return Map.copyOf(genres);
    }

    private static void register(Map<String, String> genres, String canonicalGenre, String... aliases) {
        genres.put(normalizeSearchText(canonicalGenre), canonicalGenre);
        for (String alias : aliases) {
            genres.put(normalizeSearchText(alias), canonicalGenre);
        }
    }
}
