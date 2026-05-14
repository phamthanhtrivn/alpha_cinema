package com.movieticket.user.dto.response;

import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.enums.Gender;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class EmployeeProfileDTO {
    private String fullName;
    private String phone;
    private String email;
    private LocalDate dateOfBirth;
    private Gender gender;
    private EmployeeRole role;
    private String cinemaId;
}
