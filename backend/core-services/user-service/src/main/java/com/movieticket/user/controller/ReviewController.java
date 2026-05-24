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

import com.movieticket.user.enums.ReviewStatus;
import com.movieticket.user.enums.ReviewType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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

    @GetMapping("/public/movie/{movieId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponseDTO>>> getReviewsByMovieId(
            @PathVariable("movieId") String movieId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "7") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponseDTO> reviews = reviewService.getReviewsByMovieId(movieId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy danh sách đánh giá thành công"));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkUserReviewed(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam("movieId") String movieId
    ) {
        boolean hasReviewed = reviewService.hasUserReviewedMovie(userId, movieId);
        return ResponseEntity.ok(ApiResponse.success(hasReviewed, "Kiểm tra thành công"));
    }

    @GetMapping("/customer")
    public ResponseEntity<ApiResponse<Page<ReviewResponseDTO>>> getCustomerReviews(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponseDTO> reviews = reviewService.getReviewsByCustomerId(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy danh sách đánh giá của khách hàng thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable("id") String id,
            @RequestParam(required = false, defaultValue = "Vi phạm tiêu chuẩn cộng đồng") String reason
    ) {
        reviewService.deleteReview(id, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReviewResponseDTO>>> getAllReviews(
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(required = false) String movieId,
            @RequestParam(required = false) ReviewType reviewType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReviewResponseDTO> reviews = reviewService.getAllReviews(status, movieId, reviewType, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy danh sách đánh giá thành công"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateReviewStatus(
            @PathVariable("id") String id,
            @RequestParam ReviewStatus status,
            @RequestParam(required = false, defaultValue = "") String reason
    ) {
        reviewService.updateReviewStatus(id, status, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái đánh giá thành công"));
    }
}
