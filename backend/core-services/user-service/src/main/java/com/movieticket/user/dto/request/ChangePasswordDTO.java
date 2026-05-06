package com.movieticket.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder


public class ChangePasswordDTO {
    @NotBlank(message = "Hãy nhập mật khẩu hiện tại")
    private String currentPassword;

    @NotBlank(message = "Hãy nhập mật khẩu mới")
    @Size(min = 8, message = "Mật khẩu mới phải có ít nhất 8 ký tự")
    @Pattern(regexp = ".*[A-Z].*", message = "Mật khẩu phải có ít nhất 1 chữ cái in hoa")
    @Pattern(regexp = ".*\\d.*", message = "Mật khẩu phải có ít nhất 1 chữ số")
    @Pattern(regexp = ".*[@$!%*?&~#^_-].*", message = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)")
    private String newPassword;

    @NotBlank(message = "Hãy nhập mật khẩu xác nhận")
    private String passwordConfirm;
}
