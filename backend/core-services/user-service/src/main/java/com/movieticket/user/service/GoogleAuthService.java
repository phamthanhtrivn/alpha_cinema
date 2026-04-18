package com.movieticket.user.service;


import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.Value;
import com.google.gson.Gson;
import com.movieticket.user.dto.UserResponse;
import com.movieticket.user.entity.Customer;
import com.movieticket.user.entity.User;
import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.repository.CustomerRepository;
import com.movieticket.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;


@Service
public class GoogleAuthService {
    @Value("${google.client.id}")
    private String googleClientId;

    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserResponse authenticateGoogleUser(String googleAccessToken) {

        
        try {
            RestTemplate restTemplate = new RestTemplate();
            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(googleAccessToken); // Đính Token vào Header
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 2. Thực hiện gọi API Google
            ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, Map.class);
            Map<String, Object> payload = response.getBody();

            if (payload == null || payload.get("email") == null) {
                throw new BusinessException("Không thể lấy thông tin từ Google bằng Access Token này");
            }

            String email = (String) payload.get("email");
            String name = (String) payload.get("name");


            Customer customer = customerRepository.findByEmail(email);
            UserResponse userResponse = new UserResponse();

            if (customer != null) {
                userResponse.setId(customer.getId());
                userResponse.setFullName(customer.getFullName());
                userResponse.setEmail(email); // FIX: Trước bạn để setFullName(email) là sai nhé
            } else {
                // Trường hợp: Đăng ký mới
                String password = passwordEncoder.encode("GOOGLE_AUTH_" + UUID.randomUUID());
                Customer cus = new Customer(name, email, password, true, CustomerType.MEMBER);

                // Nếu model Customer của bạn có trường Avatar, hãy set luôn:
                // cus.setAvatar(picture);

                Customer newCus = customerRepository.save(cus);

                userResponse.setId(newCus.getId());
                userResponse.setFullName(newCus.getFullName());
                userResponse.setEmail(email); // FIX: Trước bạn bị ghi đè chỗ này
            }

            userResponse.setRole("CUSTOMER");


            return userResponse;

        } catch (Exception e) {
            // Log lỗi cụ thể ra console để soi cho dễ
            e.printStackTrace();
            throw new RuntimeException("Xác thực tài khoản Google thất bại: " + e.getMessage());
        }
    }
}
