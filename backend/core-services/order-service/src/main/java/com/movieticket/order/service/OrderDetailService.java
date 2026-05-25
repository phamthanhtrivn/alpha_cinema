package com.movieticket.order.service;

import com.movieticket.order.repository.OrderDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderDetailService {
    private final OrderDetailRepository orderDetailRepository;

    public void deleteOrderDetailByOrderId(String orderId) {
        orderDetailRepository.deleteByOrderId(orderId);
    }
}
