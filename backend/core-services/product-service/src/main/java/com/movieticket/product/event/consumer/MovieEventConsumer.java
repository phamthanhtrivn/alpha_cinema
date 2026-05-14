package com.movieticket.product.event.consumer;

import com.movieticket.product.event.model.MovieRatingUpdateEvent;
import com.movieticket.product.service.MovieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieEventConsumer {
    private final MovieService movieService;

    @KafkaListener(topics = "movie-events", groupId = "product-service-group")
    public void consumeMovieRatingUpdate(MovieRatingUpdateEvent event) {
        try {
            log.info("Nhận sự kiện cập nhật rating cho phim: {} - totalReviews: {}, totalSumRating: {}", event.getMovieId(), event.getTotalReviews(), event.getTotalSumRating());
            movieService.updateRatingInfo(event.getMovieId(), event.getTotalReviews(), event.getTotalSumRating());
        } catch (Exception e) {
            log.error("Lỗi khi xử lý sự kiện cập nhật rating cho phim {}: {}", event.getMovieId(), e.getMessage());
        }
    }
}
