package com.movieticket.user.dto;

import com.movieticket.user.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2-100 ký tự")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Họ tên chỉ được chứa chữ cái và khoảng trắng")
    private String fullName;
    @NotBlank(message = "Giới tính không được để trống")
    @Pattern(regexp = "^(MALE|FEMALE)$", message = "Giới tính chỉ được là MALE hoặc FEMALE")
    private String gender;
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    @NotBlank(message = "Password không được để trống")
    private String password;
    @NotBlank(message = "passwordConfirm không được để trống")
    private String passwordConfirm;

}
