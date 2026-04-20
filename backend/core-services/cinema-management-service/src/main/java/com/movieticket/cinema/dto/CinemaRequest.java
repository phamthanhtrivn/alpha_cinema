package com.movieticket.cinema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CinemaRequest {
    @NotBlank(message = "Tên không được rỗng")
    private String name;
    @NotBlank(message = "Địa chỉ không được rỗng")
    private String address;
    @NotBlank(message = "Số điện thoại không được rỗng")
    @Pattern(regexp = "^(0[0-9]{9})$", message = "Số điện thoại phải hợp lệ")
    private String phone;
    @NotNull(message = "Trạng thái không rỗng")
    private boolean status;
}
