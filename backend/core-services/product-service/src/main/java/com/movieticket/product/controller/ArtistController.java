package com.movieticket.product.controller;

import com.movieticket.product.common.ApiResponse;
import com.movieticket.product.dto.request.ArtistCreateDTO;
import com.movieticket.product.dto.request.ArtistSearchDTO;
import com.movieticket.product.dto.response.ArtistResDTO;
import com.movieticket.product.entity.Artist;
import com.movieticket.product.service.ArtistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor

public class ArtistController {
    private final ArtistService artistService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ArtistResDTO>>> searchAritst(@RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size,
                                                                        @ModelAttribute ArtistSearchDTO dto) {
        Page<ArtistResDTO> artists = artistService.searchArtists(dto, page, size);

        ApiResponse<Page<ArtistResDTO>> pageApiResponse = ApiResponse.success(artists, "Tìm kiếm thành công!");
        return ResponseEntity.ok(pageApiResponse);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Artist>> createArtist(@Valid @RequestPart("artist") ArtistCreateDTO dto,
                                                            @RequestPart("imageFile") MultipartFile imageFile) {
        Artist savedArtist = artistService.createArtist(dto, imageFile);
        return ResponseEntity.ok(ApiResponse.success(savedArtist, "Tạo nghệ sĩ mới thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Artist>> getById(@PathVariable String id) {
        Artist artist = artistService.getById(id);

        return ResponseEntity.ok(ApiResponse.success(artist, ""));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Artist>> updateArtist(
            @PathVariable String id,
            @Valid @RequestPart("artist")  ArtistCreateDTO dto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        System.out.println(dto);
        Artist updatedArtist = artistService.updateArtist(id, dto, imageFile);

        return ResponseEntity.ok(ApiResponse.success(updatedArtist, "Cập nhật nghệ sĩ thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        artistService.delete(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Xóa nghệ sĩ thành công");
        return ResponseEntity.ok(response);
    }
}
