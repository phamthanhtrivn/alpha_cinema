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
public class EmployeeUpdateProfileDTO {
    @NotBlank(message = "Ho ten khong duoc de trong")
    @Pattern(
            regexp = "^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]*(\\s[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]*)+$",
            message = "Họ tên phải bắt đầu bằng chữ hoa và có ít nhất 2 từ, mỗi từ cách nhau bằng một khoảng trắng"
    )
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "So dien thoai khong hop le")
    private String phone;

    @NotNull(message = "Ngày sinh không được để trống")
    @Adult(min = 16, message = "Bạn phải đủ 16 tuổi để sử dụng dịch vụ")
    private LocalDate dateOfBirth;

    @NotNull(message = "Gioi tinh khong duoc de trong")
    private Gender gender;
}
