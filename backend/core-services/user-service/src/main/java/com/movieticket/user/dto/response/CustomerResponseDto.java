package com.movieticket.user.dto.response;

import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.enums.Gender;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponseDto {
    private String id;
    private String fullName;
    private String phone;
    private String email;
    private Gender gender;
    private LocalDate dateOfBirth;
    private int loyaltyPoint;
    private double totalSpending;
    private CustomerType customerType;
    private boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
