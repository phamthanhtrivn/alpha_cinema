package com.movieticket.user.dto.request;

import com.movieticket.user.enums.Gender;
import com.movieticket.user.utils.Adult;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder

public class CustomerUpdateProfileDTO {
    @NotBlank(message = "Họ tên không được để trống")
    @Pattern(
            regexp = "^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]*(\\s[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]*)+$",
            message = "Họ tên phải có ít nhất 2 từ và viết hoa chữ cái đầu mỗi từ"
    )
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotNull(message = "Ngày sinh không được để trống")
    @Adult(min = 14, message = "Bạn phải trên 14 tuổi")
    private LocalDate dateOfBirth;

    @NotNull(message = "Giới tính không được để trống")
    private Gender gender;
}
