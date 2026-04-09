package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.entity.Artist;
import com.movieticket.product.service.ArtistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor

public class ArtistController {
    private final ArtistService artistService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Artist>>> getAll(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        Page<Artist> artists = artistService.getAll(PageRequest.of(page, size));

        ApiResponse<Page<Artist>> pageApiResponse = ApiResponse.success(artists, "");
        return ResponseEntity.ok(pageApiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Artist>> getById(@PathVariable String id) {
        Artist artist = artistService.getById(id);

        return ResponseEntity.ok(ApiResponse.success(artist, ""));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

    }

}
