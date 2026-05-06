package com.movieticket.user.service;

import com.movieticket.user.dto.request.ChangePasswordDTO;
import com.movieticket.user.dto.request.CustomerUpdateProfileDTO;
import com.movieticket.user.dto.request.PasswordInfo;
import com.movieticket.user.dto.request.SearchCustomerDto;
import com.movieticket.user.dto.response.CustomerProfileDTO;
import com.movieticket.user.dto.response.CustomerResponseDto;
import com.movieticket.user.entity.Customer;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.repository.CustomerRepository;
import com.movieticket.user.repository.UserRepository;
import com.movieticket.user.utils.UserUtil;
import com.movieticket.user.utils.mapper.CustomerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
}
