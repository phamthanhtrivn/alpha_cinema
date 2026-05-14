package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.dto.request.ReviewRequestDTO;
import com.movieticket.user.dto.response.ReviewResponseDTO;
import com.movieticket.user.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> createReview(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestPart("review") @Valid ReviewRequestDTO request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        if (userId != null) {
            request.setCustomerId(userId);
        }
        ReviewResponseDTO responseDTO = reviewService.createReview(request, files);
        return ResponseEntity.ok(ApiResponse.success(responseDTO, "Đánh giá của bạn đã được gửi thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable("id") String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
    }
}
