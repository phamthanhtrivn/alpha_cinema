package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.dto.request.SearchCustomerDto;
import com.movieticket.user.dto.response.CustomerResponseDto;
import com.movieticket.user.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerResponseDto>>> getAllCustomers(
            @ModelAttribute SearchCustomerDto searchCustomerDto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CustomerResponseDto> customers = customerService.getAllCustomers(searchCustomerDto, PageRequest.of(page, size));
        ApiResponse<Page<CustomerResponseDto>> response = ApiResponse.success(customers, "Customers retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> getCustomerById(@PathVariable String id) {
        CustomerResponseDto customer = customerService.getCustomerById(id);
        ApiResponse<CustomerResponseDto> response = ApiResponse.success(customer, "Customer retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/info")
    public ResponseEntity<CustomerResponseDto> getCustomerInfo(@PathVariable String id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> updateCustomerStatus(
            @PathVariable String id,
            @RequestParam Boolean status
    ) {
        CustomerResponseDto updatedCustomer = customerService.updateCustomerStatus(id, status);
        ApiResponse<CustomerResponseDto> response = ApiResponse.success(updatedCustomer, "Customer status updated successfully");
        return ResponseEntity.ok(response);
    }
}
