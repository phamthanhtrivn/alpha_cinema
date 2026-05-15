package com.movieticket.user.service;

import com.movieticket.user.clients.OrderClient;
import com.movieticket.user.dto.request.ReviewRequestDTO;
import com.movieticket.user.dto.response.ReviewResponseDTO;
import com.movieticket.user.entity.Review;
import com.movieticket.user.enums.ReviewType;
import com.movieticket.user.event.model.ReviewModerationEvent;
import com.movieticket.user.repository.ReviewRepository;
import com.movieticket.user.utils.mapper.ReviewMapper;
import com.movieticket.user.event.producer.ReviewProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.movieticket.user.enums.ReviewStatus;
import org.springframework.web.multipart.MultipartFile;
import com.movieticket.user.utils.CloudinaryUtil;
import com.movieticket.user.event.model.MovieRatingUpdateEvent;
import com.movieticket.user.event.model.ReviewStatusNotificationEvent;

import com.movieticket.user.exception.BusinessException;
import java.util.List;
import java.util.ArrayList;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    private final ReviewMapper reviewMapper;
    private final ReviewRepository reviewRepository;
    private final OrderClient orderClient;
    private final ReviewProducer reviewProducer;
    private final CloudinaryUtil cloudinaryUtil;

    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDTO request, List<MultipartFile> files) {
        if (reviewRepository.existsByCustomerIdAndMovieId(request.getCustomerId(), request.getMovieId())) {
            throw new BusinessException("Bạn đã đánh giá phim này rồi, mỗi người chỉ được đánh giá một lần.");
        }

        Review review = reviewMapper.toEntity(request);

        // quyết định loại của reivew, đã thanh toán, xem phim hay chưa ...
        ReviewType type = orderClient.checkReviewType(request.getCustomerId(), request.getMovieId());
        review.setReviewType(type);

        if (files != null && !files.isEmpty()) {
            List<String> pictures = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String imageUrl = cloudinaryUtil.uploadImage(file);
                    if (imageUrl != null) {
                        pictures.add(imageUrl);
                    }
                }
            }
            review.setPictures(pictures);
        }

        Review savedReview = reviewRepository.save(review);

        // Bắn Event sang Kafka cho AI Service
        ReviewModerationEvent event = new ReviewModerationEvent(
                savedReview.getId(),
                savedReview.getComment(),
                savedReview.getPictures(),
                request.getCustomerId()
        );
        reviewProducer.sendReviewModerationEvent(event);

        return reviewMapper.toResponse(savedReview);
    }

    @Transactional
    public void updateReviewStatus(String reviewId, ReviewStatus status, String reason) {
        reviewRepository.findById(reviewId).ifPresent(review -> {
            review.setStatus(status);
            review.setModerationReason(reason);
            reviewRepository.save(review);
            log.info("Kết quả duyệt Review [{}]: Trạng thái = {}, Lý do = {}", reviewId, status, reason);
            
            if (status == ReviewStatus.APPROVED) {
                ReviewRepository.ReviewStats stats = reviewRepository.getReviewStatsByMovieId(review.getMovieId());
                MovieRatingUpdateEvent event = new MovieRatingUpdateEvent(
                        review.getMovieId(),
                        stats.getTotalReviews(),
                        stats.getTotalSumRating(),
                        System.currentTimeMillis()
                );
                reviewProducer.sendMovieRatingUpdateEvent(event);
            }
            
            ReviewStatusNotificationEvent notifyEvent = new ReviewStatusNotificationEvent(
                review.getCustomer().getId(),
                review.getId(),
                status.name(),
                reason
            );
            reviewProducer.sendReviewStatusNotificationEvent(notifyEvent);
        });
    }

    @Transactional
    public void deleteReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bình luận với ID: " + reviewId));
        
        // Xóa hình ảnh trên Cloudinary
        if (review.getPictures() != null && !review.getPictures().isEmpty()) {
            for (String pictureUrl : review.getPictures()) {
                try {
                    cloudinaryUtil.deleteByUrl(pictureUrl);
                } catch (Exception e) {
                    log.error("Lỗi khi xóa ảnh trên Cloudinary: {}", pictureUrl, e);
                }
            }
        }
        
        String movieId = review.getMovieId();
        ReviewStatus status = review.getStatus();
        
        // Xóa review trong DB
        reviewRepository.delete(review);
        reviewRepository.flush(); // Đảm bảo query bên dưới không tính review vừa bị xóa
        log.info("Đã xóa bình luận {}", reviewId);

        // Nếu review bị xóa là review đã được duyệt, cần cập nhật lại thông số rating cho phim
        if (status == ReviewStatus.APPROVED) {
            ReviewRepository.ReviewStats stats = reviewRepository.getReviewStatsByMovieId(movieId);
            MovieRatingUpdateEvent event = new MovieRatingUpdateEvent(
                    movieId,
                    stats.getTotalReviews(),
                    stats.getTotalSumRating(),
                    System.currentTimeMillis()
            );
            reviewProducer.sendMovieRatingUpdateEvent(event);
        }
    }

    @Transactional(readOnly = true)
    public boolean hasUserReviewedMovie(String customerId, String movieId) {
        if (customerId == null || customerId.isEmpty()) return false;
        return reviewRepository.existsByCustomerIdAndMovieId(customerId, movieId);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getReviewsByMovieId(String movieId, Pageable pageable) {
        return reviewRepository.findByMovieIdAndStatusOrderByCreatedAtDesc(movieId, ReviewStatus.APPROVED, pageable)
                .map(reviewMapper::toResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getReviewsByCustomerId(String customerId, Pageable pageable) {
        return reviewRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable)
                .map(reviewMapper::toResponse);
    }
}
