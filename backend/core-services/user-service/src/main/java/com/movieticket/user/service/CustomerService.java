package com.movieticket.user.service;

import com.movieticket.user.dto.request.SearchCustomerDto;
import com.movieticket.user.dto.response.CustomerResponseDto;
import com.movieticket.user.entity.Customer;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.repository.CustomerRepository;
import com.movieticket.user.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

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

    public CustomerResponseDto updateCustomerStatus(String customerId, Boolean status) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException("Customer not found with id: " + customerId));
        customer.setStatus(status);

        Customer updatedCustomer = customerRepository.save(customer);
        return UserUtil.toCustomerResponseDto(updatedCustomer);
    }
}
