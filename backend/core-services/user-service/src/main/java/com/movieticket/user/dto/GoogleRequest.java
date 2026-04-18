package com.movieticket.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleRequest {
    @NotBlank(message = "Token không được rỗng")
    private String token;
}
