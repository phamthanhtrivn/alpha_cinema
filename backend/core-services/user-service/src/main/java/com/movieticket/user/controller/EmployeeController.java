package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.dto.request.SearchEmployeeDto;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Employee>>> getAllEmployees(
            HttpServletRequest request,
            @ModelAttribute SearchEmployeeDto searchEmployeeDto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Employee> employees = employeeService.getAllEmployees(request, searchEmployeeDto, PageRequest.of(page, size));
        ApiResponse<Page<Employee>> response = ApiResponse.success(employees, "Employees retrieved successfully");
        return ResponseEntity.ok(response);
    }

}
