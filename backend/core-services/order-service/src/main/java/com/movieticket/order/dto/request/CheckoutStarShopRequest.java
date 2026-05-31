package com.movieticket.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CheckoutStarShopRequest {
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    private String bankCode;
    
    // In future we might just fetch the items directly from Redis in OrderService using ProductClient
    // Or we can accept the list of product items from client. Let's accept it from client for simplicity, 
    // but the safest is fetching from Redis. For now, client sends the products.
    private List<CheckoutProductItemRequest> items;
}
