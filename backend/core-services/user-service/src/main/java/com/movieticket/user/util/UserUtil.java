package com.movieticket.user.util;

import com.movieticket.user.dto.response.CustomerResponseDto;
import com.movieticket.user.entity.Customer;

public class UserUtil {

    public static CustomerResponseDto toCustomerResponseDto(Customer c) {
        return CustomerResponseDto.builder()
                .id(c.getId())
                .fullName(c.getFullName())
                .phone(c.getPhone())
                .email(c.getEmail())
                .gender(c.getGender())
                .dateOfBirth(c.getDateOfBirth())
                .loyaltyPoint(c.getLoyaltyPoint())
                .totalSpending(c.getTotalSpending())
                .customerType(c.getCustomerType())
                .status(c.isStatus())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
