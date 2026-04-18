package com.movieticket.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OtpRequest {
    @NotBlank(message = "Email không được rỗng")
    @Email(message = "Email phải đúng định dạng")
    private String email;
    @Pattern(regexp = "^[0-9]{6}$", message = "Opt có 6 kí tự, chỉ chứa số")
    String otp;
}
