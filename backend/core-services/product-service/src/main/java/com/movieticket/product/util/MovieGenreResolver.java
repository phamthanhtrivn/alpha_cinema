package com.movieticket.product.util;

import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public final class MovieGenreResolver {
    private static final Map<String, Set<String>> ALIASES_BY_KEY = buildAliases();

    private MovieGenreResolver() {
    }

    public static Set<String> resolveAliases(String genre) {
        if (!StringUtils.hasText(genre)) {
            return Set.of();
        }

        String trimmedGenre = genre.trim();
        return ALIASES_BY_KEY.getOrDefault(
                normalizeKey(trimmedGenre),
                Set.of(trimmedGenre.toLowerCase(Locale.ROOT))
        );
    }

    public static List<String> mergeGenres(String legacyGenre, List<String> genres) {
        LinkedHashSet<String> mergedGenres = new LinkedHashSet<>();
        if (genres != null) {
            genres.stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .forEach(mergedGenres::add);
        }
        if (StringUtils.hasText(legacyGenre)) {
            mergedGenres.add(legacyGenre.trim());
        }
        return List.copyOf(mergedGenres);
    }

    private static Map<String, Set<String>> buildAliases() {
        Map<String, Set<String>> aliasesByKey = new LinkedHashMap<>();
        register(aliasesByKey, "Action", "Hành động", "hanh dong");
        register(aliasesByKey, "Horror", "Kinh dị", "kinh di", "ma");
        register(aliasesByKey, "Romance", "Tình cảm", "tinh cam", "Lãng mạn", "lang man");
        register(aliasesByKey, "Comedy", "Hài hước", "hai huoc", "hài", "hai", "vui", "vui vui");
        register(aliasesByKey, "Sci-Fi", "Science Fiction", "Viễn tưởng", "vien tuong");
        register(aliasesByKey, "Fantasy", "Giả tưởng", "gia tuong");
        register(aliasesByKey, "Adventure", "Phiêu lưu", "phieu luu");
        register(aliasesByKey, "Drama", "Chính kịch", "chinh kich", "Tâm lý", "tam ly");
        register(aliasesByKey, "Thriller", "Giật gân", "giat gan");
        register(aliasesByKey, "Biography", "Tiểu sử", "tieu su");
        register(aliasesByKey, "History", "Lịch sử", "lich su");
        register(aliasesByKey, "Crime", "Tội phạm", "toi pham");
        return Map.copyOf(aliasesByKey);
    }

    private static void register(Map<String, Set<String>> aliasesByKey, String... aliases) {
        Set<String> storedAliases = new LinkedHashSet<>();
        for (String alias : aliases) {
            storedAliases.add(alias.toLowerCase(Locale.ROOT));
        }

        Set<String> immutableAliases = Set.copyOf(storedAliases);
        for (String alias : aliases) {
            aliasesByKey.put(normalizeKey(alias), immutableAliases);
        }
    }

    private static String normalizeKey(String value) {
        String withoutAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');
        return withoutAccents
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }
}
