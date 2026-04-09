package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.dto.LoginRequest;
import com.movieticket.user.dto.LoginResponse;
import com.movieticket.user.dto.RegisterRequest;
import com.movieticket.user.dto.UserResponse;
import com.movieticket.user.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ApiResponse<?> register(@Validated @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ApiResponse.success(null, "Register thành công");
    }
    @PostMapping("/login")
    public ApiResponse<?> login(@Validated @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        UserResponse user = authService.login(loginRequest);
        if(user != null){
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            Cookie cookie = new Cookie("refreshToken", refreshToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(cookie);
            LoginResponse loginResponse = new LoginResponse(accessToken,user);
            return ApiResponse.success(loginResponse, "Đăng nhập thành công");
        }
        return ApiResponse.fail("Đăng nhập không thành công");
    }
}
