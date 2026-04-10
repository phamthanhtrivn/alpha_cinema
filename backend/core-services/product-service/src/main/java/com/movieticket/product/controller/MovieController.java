package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.dto.request.ArtistCreateDTO;
import com.movieticket.product.dto.request.MovieCreateDTO;
import com.movieticket.product.dto.request.MovieSearchDTO;
import com.movieticket.product.dto.response.MovieSummaryDTO;
import com.movieticket.product.entity.Artist;
import com.movieticket.product.entity.Movie;
import com.movieticket.product.enums.ReleaseStatus;
import com.movieticket.product.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor

public class MovieController {
    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Movie>>> searchMovies(@RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "10") int size,
                                                                 @ModelAttribute MovieSearchDTO dto) {
        Page<Movie> movies = movieService.searchMovies(dto, page, size);

        ApiResponse<Page<Movie>> pageApiResponse = ApiResponse.success(movies, "Tìm kiếm thành công!");
        return ResponseEntity.ok(pageApiResponse);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MovieSummaryDTO>> createMovie(@Valid @RequestPart("movie") MovieCreateDTO dto,
                                                                    @RequestPart("imageFile") MultipartFile imageFile) {
        MovieSummaryDTO savedMovie = movieService.createMovie(dto, imageFile);
        return ResponseEntity.ok(ApiResponse.success(savedMovie, "Thêm phim mới thành công"));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MovieSummaryDTO>> updateMovie(@PathVariable String id,
                                                                    @Valid @RequestPart("movie") MovieCreateDTO dto,
                                                                    @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        MovieSummaryDTO savedMovie = movieService.updateMovie(id, dto, imageFile);
        return ResponseEntity.ok(ApiResponse.success(savedMovie, "Cập nhật phim thành công"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateMovieStatus(
            @PathVariable String id,
            @RequestParam ReleaseStatus status ) {

        movieService.updateReleaseStatus(id,status);

        ApiResponse<Void> response = ApiResponse.success(null, "Cập nhật trạng thái phim thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        movieService.deleteMovie(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Xóa phim thành công");
        return ResponseEntity.ok(response);
    }
}
