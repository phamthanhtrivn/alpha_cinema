package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.dto.*;
import com.movieticket.user.service.*;
import com.movieticket.user.utils.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
    @Autowired
    private GoogleAuthService googleAuthService;


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
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("None")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
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
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return ApiResponse.success(null,"Đăng xuất thành công");
    }
    @GetMapping("/profile")
    public ApiResponse<?> getProfile(HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            String accessToken = authHeader.substring(7);
            if(jwtUtils.isTokenExpired(accessToken)){
                return ApiResponse.fail("accessToken het han !");
            }
            String email = jwtUtils.extractEmail(accessToken);
            String role = jwtUtils.extractRole(accessToken);
            String userId = jwtUtils.extractId(accessToken);
            String fullName = jwtUtils.extractFullName(accessToken);
            UserResponse userResponse = new UserResponse(userId,email,fullName,role);
            return ApiResponse.success(userResponse, "Lấy thông tin thành công");
        }
        return ApiResponse.fail("Không tìm được accessToken!");
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
            if(!jwtUtils.isResetTokenValid(token,resetPassword.getEmail())){
                return ApiResponse.fail("Token không hợp lệ");
            }
        }
        if(authService.resetPassword(resetPassword)){

            return ApiResponse.success(null,"Cập nhật password thành công !");
        }
        return ApiResponse.fail("Cập nhật password thành công thất bại !");
    }

    @PostMapping("/refresh-token")
    public ApiResponse<?> refreshToken(@CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return ApiResponse.fail("Không tìm thấy Refresh Token. Vui lòng đăng nhập lại.");
        }
        if (jwtUtils.isTokenExpired(refreshToken)) {
            return ApiResponse.fail("Token đã hết hạn");
        }
        String email = jwtUtils.extractEmail(refreshToken);
        String role = jwtUtils.extractRole(refreshToken);
        String userId = jwtUtils.extractId(refreshToken);
        String fullName = jwtUtils.extractFullName(refreshToken);

        UserResponse userResponse = new UserResponse(userId, email, fullName, role);

        String newAccessToken = jwtUtils.generateAccessToken(userResponse);
        String newRefreshToken = jwtUtils.generateRefreshToken(userResponse);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        LoginResponse loginResponse = new LoginResponse(newAccessToken, userResponse);
        return ApiResponse.success(loginResponse, "Refresh token thành công");
    }

    @PostMapping("/google-login")
    public ApiResponse<LoginResponse> googleLogin(@RequestBody GoogleRequest googleRequest, HttpServletResponse response){

        if(googleRequest.getToken() == null || googleRequest.getToken().trim().isEmpty()){
            ApiResponse.fail("token khong co");
        }
        UserResponse user = googleAuthService.authenticateGoogleUser(googleRequest.getToken());

        if(user != null){
            String accessToken = jwtUtils.generateAccessToken(user);
            String refreshToken = jwtUtils.generateRefreshToken(user);
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("None")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            LoginResponse loginResponse = new LoginResponse(accessToken,user);
            return ApiResponse.success(loginResponse, "Đăng nhập thành công");
        }
        return ApiResponse.fail("token khong hop le");
    }
}
