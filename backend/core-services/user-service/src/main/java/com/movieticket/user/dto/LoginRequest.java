package com.movieticket.user.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;

@Getter
@Setter
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    @NotBlank(message = "Password không được để trống")
    private String password;
    @NotBlank(message = "Role không được để trống")
    @Pattern(regexp = "CUSTOMER|EMPLOYEE", message = "Role chỉ được là CUSTOMER hoặc EMPLOYEE")
    private String role;
}
