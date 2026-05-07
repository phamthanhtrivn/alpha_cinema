package com.movieticket.user.service;

import com.movieticket.user.dto.request.*;
import com.movieticket.user.dto.response.CustomerProfileDTO;
import com.movieticket.user.dto.response.CustomerResponseDto;
import com.movieticket.user.entity.Customer;
import com.movieticket.user.event.model.SendOTPEvent;
import com.movieticket.user.event.producer.CustomerProducer;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.repository.CustomerRepository;
import com.movieticket.user.repository.UserRepository;
import com.movieticket.user.utils.UserUtil;
import com.movieticket.user.utils.mapper.CustomerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final CustomerProducer customerProducer;

    public Page<CustomerResponseDto> getAllCustomers(SearchCustomerDto searchCustomerDto, Pageable pageable) {
        Page<Customer> customers = customerRepository.searchAllCustomers(
                searchCustomerDto.getFullName(),
                searchCustomerDto.getEmail(),
                searchCustomerDto.getPhone(),
                searchCustomerDto.getGender(),
                searchCustomerDto.getStatus(),
                searchCustomerDto.getCustomerType(),
                searchCustomerDto.getMinPoints(),
                searchCustomerDto.getMaxPoints(),
                searchCustomerDto.getMinTotalSpending(),
                searchCustomerDto.getMaxTotalSpending(),
                pageable
        );

        return customers.map(UserUtil::toCustomerResponseDto);
    }

    public CustomerResponseDto getCustomerById(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException("Customer not found with id: " + customerId));
        return UserUtil.toCustomerResponseDto(customer);
    }

    public CustomerResponseDto updateCustomerStatus(String customerId, Boolean status) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException("Customer not found with id: " + customerId));
        customer.setStatus(status);

        Customer updatedCustomer = customerRepository.save(customer);
        return UserUtil.toCustomerResponseDto(updatedCustomer);
    }

    public CustomerProfileDTO getCustomerProfile(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + customerId));

        return customerMapper.toProfileDTO(customer);
    }

    @Transactional
    public CustomerProfileDTO updateCustomerProfile(String customerId, CustomerUpdateProfileDTO updateDTO) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + customerId));

        customerMapper.updateCustomerProfileFromDto(updateDTO, customer);

        customer = customerRepository.save(customer);

        return customerMapper.toProfileDTO(customer);
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordDTO dto) {
        PasswordInfo info = userRepository.findPasswordInfoById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), info.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }

        userRepository.updatePassword(userId, passwordEncoder.encode(dto.getNewPassword()));
    }

    @Transactional(readOnly = true)
    public void requestUpdateEmail(String userId, String email) {
        if (customerRepository.existsByEmail(email)) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }

        String redisKey = "email-update:otp:" + userId;

        Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
        if (ttl != null && ttl > 240) { // Nếu mã cũ còn hơn 4 phút (mới gửi được < 1 phút)
            throw new RuntimeException("Vui lòng đợi 60 giây trước khi yêu cầu mã mới!");
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));

        redisTemplate.opsForValue().set(redisKey, otp + ":" + email, 5, TimeUnit.MINUTES);

        SendOTPEvent event = SendOTPEvent.builder()
                .userEmail(email)
                .subject("Xác nhận thay đổi Email - Alpha Cinema")
                .content(otp)
                .type("EMAIL_UPDATE")
                .build();

        customerProducer.sendOtpEmail(event);
    }

    @Transactional
    public String verifyAndUpdateEmail(String userId, EmailVerifyReq req) {
        String redisKey = "email-update:otp:" + userId;
        String data = redisTemplate.opsForValue().get(redisKey);

        if (data == null) {
            throw new RuntimeException("Mã OTP đã hết hạn");
        }

        String[] parts = data.split(":");
        String savedOtp = parts[0];
        String newEmail = parts[1];

        if (!savedOtp.equals(req.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác vui lòng thử lại");
        }

        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        customer.setEmail(newEmail);
        customerRepository.save(customer);

        redisTemplate.delete(redisKey);
        log.info("User {} đã đổi email sang {} thành công", userId, newEmail);
        return newEmail;
    }
}
