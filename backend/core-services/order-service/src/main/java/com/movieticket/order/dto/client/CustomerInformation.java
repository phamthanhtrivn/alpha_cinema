package com.movieticket.order.dto.client;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CustomerInformation {
    private String id;
    private String fullName;
    private String phone;
    private String email;
    private String gender;
    private LocalDate dateOfBirth;
    private int loyaltyPoint;
    private double totalSpending;
    private String customerType;
    private boolean status;
    private LocalDateTime createdAt;
}
