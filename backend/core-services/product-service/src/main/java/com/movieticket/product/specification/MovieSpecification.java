package com.movieticket.product.specification;

import com.movieticket.product.entity.AgeType;
import com.movieticket.product.entity.Artist;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.ReleaseStatus;
import com.movieticket.product.enums.TranslationType;
import com.movieticket.product.util.MovieGenreResolver;
import com.movieticket.product.util.MovieNationalityResolver;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class MovieSpecification {

    public static Specification<Movie> hasTitle(String title) {
        return (root, query, cb) -> {
            if (title == null || title.isEmpty()) return null;
            return cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    public static Specification<Movie> hasReleaseStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isEmpty()) return null;
            return cb.equal(root.get("releaseStatus"), ReleaseStatus.valueOf(status));
        };
    }

    public static Specification<Movie> hasNationality(String nationality) {
        return (root, query, cb) -> (nationality == null || nationality.isEmpty())
                ? null : cb.lower(root.get("nationality"))
                .in(MovieNationalityResolver.resolveAliases(nationality));
    }

    public static Specification<Movie> hasAgeType(String ageTypeId) {
        return (root, query, cb) -> (ageTypeId == null || ageTypeId.isEmpty())
                ? null : cb.equal(root.get("ageType").get("id"), ageTypeId);
    }

    public static Specification<Movie> hasReleaseYear(Integer year) {
        return (root, query, cb) -> (year == null) ? null : cb.equal(root.get("releaseYear"), year);
    }

    // Lọc theo ElementCollection (Set<String> genre)
    public static Specification<Movie> hasGenre(String genre) {
        return hasGenres(genre == null ? List.of() : List.of(genre), "ANY");
    }

    public static Specification<Movie> hasGenres(List<String> genres, String matchMode) {
        List<Set<String>> aliasGroups = genres == null
                ? List.of()
                : genres.stream()
                        .map(MovieGenreResolver::resolveAliases)
                        .filter(aliases -> !aliases.isEmpty())
                        .toList();

        return (root, query, cb) -> {
            if (aliasGroups.isEmpty()) {
                return null;
            }

            query.distinct(true);
            if (!"ALL".equalsIgnoreCase(matchMode)) {
                Set<String> aliases = aliasGroups.stream()
                        .flatMap(Set::stream)
                        .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
                Join<Movie, String> genreJoin = root.join("genre");
                return cb.lower(genreJoin).in(aliases);
            }

            List<Predicate> predicates = aliasGroups.stream()
                    .map(aliases -> hasGenreAlias(root, query, cb, aliases))
                    .toList();
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Predicate hasGenreAlias(
            Root<Movie> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            Set<String> aliases
    ) {
        Subquery<Integer> subquery = query.subquery(Integer.class);
        Root<Movie> correlatedMovie = subquery.correlate(root);
        Join<Movie, String> genreJoin = correlatedMovie.join("genre");
        subquery.select(cb.literal(1))
                .where(cb.lower(genreJoin).in(aliases));
        return cb.exists(subquery);
    }

    // Lọc theo ElementCollection Enum (Set<ProjectionType>)
    public static Specification<Movie> hasProjectionType(ProjectionType type) {
        return (root, query, cb) -> (type == null)
                ? null : cb.isMember(type, root.get("supportedProjection"));
    }

    // Lọc theo ElementCollection Enum (Set<TranslationType>)
    public static Specification<Movie> hasTranslationType(TranslationType type) {
        return (root, query, cb) -> (type == null)
                ? null : cb.isMember(type, root.get("supportedTranslation"));
    }

    // Lọc theo quan hệ ManyToMany (Nghệ sĩ xuất hiện trong danh sách Actors hoặc Directors)
    public static Specification<Movie> hasArtist(String artistId) {
        return (root, query, cb) -> {
            if (artistId == null || artistId.isEmpty()) return null;
            query.distinct(true); // Tránh trùng lặp khi join
            return cb.or(
                    cb.equal(root.join("actors").get("id"), artistId),
                    cb.equal(root.join("directors").get("id"), artistId)
            );
        };
    }
}

