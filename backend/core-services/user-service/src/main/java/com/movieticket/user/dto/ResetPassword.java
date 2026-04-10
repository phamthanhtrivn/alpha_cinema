package com.movieticket.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPassword {
    @NotBlank(message = "Email không được rỗng")
    @Email(message = "Email phải đúng định dạng")
    private String email;
    @NotBlank(message = "Password không được để trống")
    private String password;
    @NotBlank(message = "passwordConfirm không được để trống")
    private String passwordConfirm;
}
