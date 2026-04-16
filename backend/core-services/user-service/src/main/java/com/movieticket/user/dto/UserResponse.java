package com.movieticket.user.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String email;
    private String fullName;
    private String role;
}
