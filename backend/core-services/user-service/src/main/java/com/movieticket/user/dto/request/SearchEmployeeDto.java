package com.movieticket.user.dto.request;

import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SearchEmployeeDto {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private Gender gender;
    private Boolean status;
    private EmployeeRole role;
    private String cinemaId;
}
