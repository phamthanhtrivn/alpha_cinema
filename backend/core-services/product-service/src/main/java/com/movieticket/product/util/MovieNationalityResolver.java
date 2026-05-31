package com.movieticket.product.util;

import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public final class MovieNationalityResolver {
    private static final Map<String, Set<String>> ALIASES_BY_KEY = buildAliases();

    private MovieNationalityResolver() {
    }

    public static Set<String> resolveAliases(String nationality) {
        if (!StringUtils.hasText(nationality)) {
            return Set.of();
        }

        String trimmedNationality = nationality.trim();
        return ALIASES_BY_KEY.getOrDefault(
                normalizeKey(trimmedNationality),
                Set.of(trimmedNationality.toLowerCase(Locale.ROOT))
        );
    }

    private static Map<String, Set<String>> buildAliases() {
        Map<String, Set<String>> aliasesByKey = new LinkedHashMap<>();
        register(aliasesByKey, "Vietnam", "Việt Nam", "viet nam", "việt", "viet");
        register(aliasesByKey, "South Korea", "Hàn Quốc", "han quoc", "Hàn", "han", "Korea", "Korean");
        register(aliasesByKey, "USA", "United States", "Mỹ", "my", "Hoa Kỳ", "hoa ky", "American");
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
