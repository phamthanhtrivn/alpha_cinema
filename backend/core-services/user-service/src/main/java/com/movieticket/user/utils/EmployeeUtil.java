package com.movieticket.user.utils;

import com.movieticket.user.dto.response.EmployeeResponseDto;
import com.movieticket.user.entity.Employee;

public class EmployeeUtil {

    public static EmployeeResponseDto toEmployeeResponseDto(Employee e) {
        return EmployeeResponseDto.builder()
                .id(e.getId())
                .fullName(e.getFullName())
                .phone(e.getPhone())
                .email(e.getEmail())
                .gender(e.getGender())
                .dateOfBirth(e.getDateOfBirth())
                .status(e.isStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .role(e.getRole())
                .cinemaId(e.getCinemaId())
                .build();
    }
}
