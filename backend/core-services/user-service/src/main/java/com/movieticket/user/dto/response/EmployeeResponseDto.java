package com.movieticket.user.dto.response;

import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.enums.Gender;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class EmployeeResponseDto {
    private String id;
    private String fullName;
    private String phone;
    private String email;
    private Gender gender;
    private LocalDate dateOfBirth;
    private boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private EmployeeRole role;
    private String cinemaId;
}
