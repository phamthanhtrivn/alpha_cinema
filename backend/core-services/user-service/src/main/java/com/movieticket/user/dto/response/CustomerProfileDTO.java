package com.movieticket.user.dto.response;

import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.enums.Gender;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder

public class CustomerProfileDTO {
    private String fullName;
    private String phone;
    private String email;
    private LocalDate dateOfBirth;
    private Gender gender;
    private CustomerType customerType;
    private int loyaltyPoint;
    private double totalSpending;
}
