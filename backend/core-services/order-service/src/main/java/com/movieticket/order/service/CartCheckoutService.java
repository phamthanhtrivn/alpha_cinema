package com.movieticket.order.service;

import com.movieticket.order.dto.client.CinemaSnapshot;
import com.movieticket.order.dto.client.CustomerInformation;
import com.movieticket.order.dto.client.PaymentInitiateSnapshot;
import com.movieticket.order.dto.request.CartCheckoutRequest;
import com.movieticket.order.dto.request.CheckoutProductItemRequest;
import com.movieticket.order.dto.response.CheckoutConfirmResponse;
import com.movieticket.order.entity.Order;
import com.movieticket.order.entity.OrderDetail;
import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.entity.Promotion;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.model.cache.ProductCache;
import com.movieticket.order.repository.OrderRepository;
import com.movieticket.order.repository.OrderDetailRepository;
import com.movieticket.order.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CartCheckoutService {
    private static final int POINT_VALUE_VND = 1_000;

    private final CheckoutPartnerGateway checkoutPartnerGateway;
    private final PromotionCacheService promotionCacheService;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final PromotionRepository promotionRepository;

    @Transactional
    public CheckoutConfirmResponse checkoutCart(String customerId, CartCheckoutRequest request, String userIp) {
        // 1. Retrieve customer info
        CustomerInformation customer = checkoutPartnerGateway.getCustomerInformation(customerId);

        // 2. Validate cinema location
        CinemaSnapshot cinema = checkoutPartnerGateway.getCinemaSnapshot(request.getCinemaId());

        // 3. Resolve and validate products
        List<String> productIds = request.getProducts().stream()
                .map(CheckoutProductItemRequest::getProductId)
                .toList();
        Map<String, ProductCache> productsById = checkoutPartnerGateway.getProducts(productIds);

        double productSubtotal = 0.0;
        List<OrderDetail> pendingDetails = new ArrayList<>();

        for (CheckoutProductItemRequest item : request.getProducts()) {
            ProductCache product = productsById.get(item.getProductId());
            if (product == null || !product.isStatus()) {
                throw new BusinessException("Sản phẩm không khả dụng: " + item.getProductId());
            }

            double subtotal = product.getUnitPrice() * item.getQuantity();
            productSubtotal += subtotal;

            pendingDetails.add(OrderDetail.builder()
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .price(product.getUnitPrice())
                    .subTotal(subtotal)
                    .build());
        }

        // 4. Resolve promotion
        Promotion promotion = null;
        double promotionDiscount = 0.0;
        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            promotion = promotionCacheService.getPromotionEntity(request.getPromotionCode());
            promotionDiscount = productSubtotal * (promotion.getDiscount() / 100.0);
            promotion.setRemainingQuantity(promotion.getRemainingQuantity() - 1);
            promotion = promotionRepository.save(promotion);
        }

        // 5. Resolve loyalty points
        double pointDiscount = 0.0;
        int pointsRedeemed = 0;
        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0) {
            pointsRedeemed = request.getPointsToRedeem();
            if (customer.getLoyaltyPoint() < pointsRedeemed) {
                throw new BusinessException("Số điểm tích lũy của bạn không đủ.");
            }
            pointDiscount = pointsRedeemed * POINT_VALUE_VND;
            double maxAllowedPointDiscount = Math.max(productSubtotal - promotionDiscount, 0.0);
            if (pointDiscount > maxAllowedPointDiscount) {
                pointDiscount = maxAllowedPointDiscount;
                pointsRedeemed = (int) Math.ceil(pointDiscount / POINT_VALUE_VND);
            }
        }

        double totalPayment = Math.max(productSubtotal - promotionDiscount - pointDiscount, 0.0);

        // 6. Create Order
        Order order = Order.builder()
                .qrCode("")
                .customerId(customerId)
                .employeeId(null)
                .cinemaId(request.getCinemaId())
                .totalPrice(productSubtotal)
                .pointDiscount(pointDiscount)
                .promotionDiscount(promotionDiscount)
                .promotion(promotion)
                .totalPayment(totalPayment)
                .status(OrderStatus.PENDING_PAYMENT)
                .build();

        Order savedOrder = orderRepository.save(order);

        // 7. Save OrderDetails
        for (OrderDetail detail : pendingDetails) {
            detail.setOrder(savedOrder);
        }
        orderDetailRepository.saveAll(pendingDetails);

        // 8. Initiate payment or confirm immediately if zero payment
        String paymentUrl = "";
        String paymentMethod = request.getPaymentMethod();
        if (totalPayment <= 0.0001) {
            savedOrder.setStatus(OrderStatus.PAID);
            orderRepository.save(savedOrder);
            paymentMethod = "POINTS";
        } else {
            PaymentInitiateSnapshot paymentSnapshot = checkoutPartnerGateway.initiatePayment(
                    savedOrder.getId(),
                    request.getPaymentMethod(),
                    totalPayment,
                    request.getBankCode(),
                    userIp
            );
            paymentUrl = paymentSnapshot.getPaymentUrl();
            paymentMethod = paymentSnapshot.getMethod();
        }

        return CheckoutConfirmResponse.builder()
                .orderId(savedOrder.getId())
                .status(savedOrder.getStatus().name())
                .message("Đơn hàng bắp nước đã được khởi tạo thành công.")
                .seats(new ArrayList<>()) // No seats for product-only
                .products(new ArrayList<>()) // Can be empty or mapped to response
                .paymentMethod(paymentMethod)
                .paymentUrl(paymentUrl)
                .totalPayment(totalPayment)
                .build();
    }
}
