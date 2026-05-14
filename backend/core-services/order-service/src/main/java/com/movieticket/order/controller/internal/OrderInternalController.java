package com.movieticket.order.controller.internal;

import com.movieticket.order.enums.ReviewType;
import com.movieticket.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/internal/order")

public class OrderInternalController {
    @Autowired
    private OrderService orderService;

    @GetMapping("/review-type")
    public ResponseEntity<ReviewType> getReviewType(@RequestParam String customerId,
                                                     @RequestParam String movieId) {
        ReviewType reviewType = orderService.getReviewTypeForCustomer(customerId, movieId);

        return ResponseEntity.ok(reviewType);
    }
}
