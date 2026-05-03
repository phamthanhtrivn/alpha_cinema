package com.movieticket.order.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PromotionUpdateRequest {
    @NotNull(message = "Id không được null")
    private String id;
    @NotNull(message = "Code không được null")
    private String code;
    @NotNull(message = "Discount không được null")
    @Min(value = 0, message = "Discount phải lớn hơn hoặc bằng 0")
    private Integer discount;
    @NotNull(message = "Start date không được null")
    @FutureOrPresent(message = "Start date phải >= thời điểm hiện tại")
    private LocalDateTime startDate;
    @NotNull(message = "End date không được null")
    @Future(message = "End date phải ở tương lai")
    private LocalDateTime endDate;
    @NotNull(message = "quantity không được null")
    @Min(value = 1, message = "Quantity phải lớn hơn hoặc bằng 1")
    private Integer quantity;
    @NotNull(message = "status không được null")
    private Boolean status;
}
