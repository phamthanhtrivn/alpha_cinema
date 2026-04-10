package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.dto.*;
import com.movieticket.user.service.AuthService;
import com.movieticket.user.service.EmailService;
import com.movieticket.user.service.JwtService;
import com.movieticket.user.service.OtpService;
import com.movieticket.user.utils.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@RestController
@RequestMapping("/api/users")
public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private OtpService otpService;


    @PostMapping("/register")
    public ApiResponse<?> register(@Validated @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ApiResponse.success(null, "Register thành công");
    }

    @PostMapping("/login")
    public ApiResponse<?> login(@Validated @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        UserResponse user = authService.login(loginRequest);
        if(user != null){
            String accessToken = jwtUtils.generateAccessToken(user);
            String refreshToken = jwtUtils.generateRefreshToken(user);
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

    @PostMapping("/logout")
    public  ApiResponse<?> logout(HttpServletResponse response, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            String accessToken = authHeader.substring(7);
            Date expiration = jwtUtils.extractExpiration(accessToken);
            long remainingTime = expiration.getTime() - System.currentTimeMillis();
            System.out.println("So giay con lai , : ============"  + remainingTime);
            jwtService.blacklistToken(accessToken, remainingTime);
        }
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ApiResponse.success(null,"Đăng xuất thành công");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<?> forgotPassword(@Validated @RequestBody ForgotPasswordRequest forgotPasswordRequest) {

        if(authService.forgetPassword(forgotPasswordRequest)){
            String otp = otpService.generateOtp(forgotPasswordRequest.getEmail());
            emailService.sendOtp(forgotPasswordRequest.getEmail(), otp);
            return ApiResponse.success(null, "Mã otp đã được gửi đến mail của bạn");
        }
        return ApiResponse.fail("Email không tồn tại !");
    }

    @PostMapping("/forgot-password/otp")
    public ApiResponse<?> verifyOtp(@Validated @RequestBody OtpRequest otpRequest) {
        if(otpService.validateOtp(otpRequest.getEmail(), otpRequest.getOtp())){
            String tokenResetPassword = jwtUtils.generateResetPasswordToken(otpRequest.getEmail());
            return ApiResponse.success(tokenResetPassword,"Mã opt hợp lệ!");
        }

        return ApiResponse.fail("Email không tồn tại !");
    }

    @PostMapping("/forgot-password/reset-password")
    public ApiResponse<?> resetPassword(@Validated @RequestBody ResetPassword resetPassword, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            String token = authHeader.substring(7);
            System.out.println("token : " + token);
            if(!jwtUtils.isResetTokenValid(token,resetPassword.getEmail())){
                return ApiResponse.fail("Token không hợp lệ");
            }
        }
        if(authService.resetPassword(resetPassword)){

            return ApiResponse.success(null,"Cập nhật password thành công !");
        }
        return ApiResponse.fail("Cập nhật password thành công thất bại !");
    }

}
