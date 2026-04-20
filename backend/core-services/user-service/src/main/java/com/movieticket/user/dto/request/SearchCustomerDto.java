package com.movieticket.user.dto.request;

import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SearchCustomerDto {
    private String fullName;
    private String email;
    private String phone;
    private Gender gender;
    private Boolean status;
    private CustomerType customerType;
    private Integer minPoints;
    private Integer maxPoints;
    private Double minTotalSpending;
    private Double maxTotalSpending;
}
