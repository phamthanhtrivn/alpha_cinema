package com.movieticket.product.service;

import com.movieticket.product.dto.admin.request.MovieCreateDTO;
import com.movieticket.product.dto.admin.request.MovieSearchDTO;
import com.movieticket.product.dto.admin.response.MovieSummaryDTO;
import com.movieticket.product.dto.admin.response.SelectionDTO;
import com.movieticket.product.dto.client.MovieDetailPublicDTO;
import com.movieticket.product.dto.client.MoviePublicDTO;
import com.movieticket.product.entity.AgeType;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.enums.ReleaseStatus;
import com.movieticket.product.exception.BusinessException;
import com.movieticket.product.repository.AgeTypeRepository;
import com.movieticket.product.repository.MovieRepository;
import com.movieticket.product.specification.MovieSpecification;
import com.movieticket.product.util.CloudinaryUtil;
import com.movieticket.product.util.mapper.MovieMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor

public class MovieService {
    private final MovieRepository movieRepository;
    private final ArtistService artistService;
    private final AgeTypeRepository ageTypeRepository;
    private final CloudinaryUtil cloudinaryUtil;
    private final MovieMapper movieMapper;

    public Movie getById(String id) {
        return movieRepository.findById(id).orElseThrow(() -> new BusinessException("Không tìm thấy phim"));
    }

    @Transactional(readOnly = true)
    public Page<MovieSummaryDTO> searchMovies(MovieSearchDTO dto, int page, int size) {
        Specification<Movie> spec = Specification.where(MovieSpecification.hasTitle(dto.getTitle()))
                .and(MovieSpecification.hasReleaseStatus(dto.getReleaseStatus()))
                .and(MovieSpecification.hasNationality(dto.getNationality()))
                .and(MovieSpecification.hasAgeType(dto.getAgeTypeId()))
                .and(MovieSpecification.hasReleaseYear(dto.getReleaseYear()))
                .and(MovieSpecification.hasGenre(dto.getGenre()))
                .and(MovieSpecification.hasArtist(dto.getArtistId()))
                .and(MovieSpecification.hasProjectionType(dto.getProjectionType()))
                .and(MovieSpecification.hasTranslationType(dto.getTranslationType()));

        Pageable pageable = PageRequest.of(page, size);
        Page<Movie> moviePage = movieRepository.findAll(spec, pageable);
        return moviePage.map(movieMapper::toResponseAdmin);
    }

    public Page<MoviePublicDTO> clientSearchMovie(MovieSearchDTO dto, Pageable pageable) {
        Specification<Movie> spec = Specification.where(MovieSpecification.hasTitle(dto.getTitle()))
                .and(MovieSpecification.hasReleaseStatus(dto.getReleaseStatus()));

        Page<Movie> moviePage = movieRepository.findAll(spec, pageable);
        return moviePage.map(movieMapper::toResponsePublic);
    }

    @Transactional(readOnly = true)
    public MovieDetailPublicDTO clientGetDetailMovie(String id) {
        Movie movie = this.getById(id);

        return movieMapper.toMovieDetailPublic(movie);
    }

    public List<AgeType> getAllAgeType() {
        return ageTypeRepository.findAll();
    }

    public List<SelectionDTO> getMovieSuggestions(String query, int size) {

        Pageable pageable = PageRequest.of(0, size);

        return movieRepository.findMovieSuggestions(query, pageable);
    }

    @Transactional
    public MovieSummaryDTO createMovie(MovieCreateDTO dto, MultipartFile thumbnail) {
        String thumbnailUrl = null;
        if (thumbnail != null && !thumbnail.isEmpty()) {
            thumbnailUrl = cloudinaryUtil.uploadImage(thumbnail);
        }

        Movie movie = movieMapper.toEntity(dto);
        movie.setThumbnailUrl(thumbnailUrl);

        if (dto.getAgeTypeId() != null) {
            AgeType proxyAgeType = ageTypeRepository.getReferenceById(dto.getAgeTypeId());
            movie.setAgeType(proxyAgeType);
        }

        if (dto.getActorIds() != null) {
            movie.setActors(artistService.getArtistProxies(dto.getActorIds()));
        }

        if (dto.getDirectorIds() != null) {
            movie.setDirectors(artistService.getArtistProxies(dto.getDirectorIds()));
        }

        return movieMapper.toResponseAdmin(movieRepository.save(movie));
    }

    @Transactional
    public MovieSummaryDTO updateMovie(String id, MovieCreateDTO dto, MultipartFile thumbnail) {
        Movie movie = getById(id);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            cloudinaryUtil.deleteByUrl(movie.getThumbnailUrl());
            movie.setThumbnailUrl(cloudinaryUtil.uploadImage(thumbnail));
        }

        movieMapper.updateEntityFromDto(dto, movie);

        if (dto.getAgeTypeId() != null) {
            AgeType proxyAgeType = ageTypeRepository.getReferenceById(dto.getAgeTypeId());
            movie.setAgeType(proxyAgeType);
        }

        movie.setActors(artistService.getArtistProxies(dto.getActorIds()));

        movie.setDirectors(artistService.getArtistProxies(dto.getDirectorIds()));

        return movieMapper.toResponseAdmin(movieRepository.save(movie));
    }

    @Transactional
    public void updateReleaseStatus(String id, ReleaseStatus newStatus) {
        Movie movie = getById(id);

        movie.setReleaseStatus(newStatus);
    }

    public void deleteMovie(String id) {
        Movie movie = getById(id);
        cloudinaryUtil.deleteByUrl(movie.getThumbnailUrl());
        movieRepository.delete(movie);
    }

}
