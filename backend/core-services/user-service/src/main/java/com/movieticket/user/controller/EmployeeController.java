package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.dto.request.CreateEmployeeDto;
import com.movieticket.user.dto.request.SearchEmployeeDto;
import com.movieticket.user.dto.request.UpdateEmployeeDto;
import com.movieticket.user.dto.response.EmployeeResponseDto;
import com.movieticket.user.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    public ResponseEntity<ApiResponse<Page<EmployeeResponseDto>>> getAllEmployees(
            HttpServletRequest request,
            @ModelAttribute SearchEmployeeDto searchEmployeeDto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<EmployeeResponseDto> employees = employeeService.getAllEmployees(request, searchEmployeeDto, PageRequest.of(page, size));
        ApiResponse<Page<EmployeeResponseDto>> response = ApiResponse.success(employees, "Lấy danh sách nhân viên thành công");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> createEmployee(HttpServletRequest request, @RequestBody @Valid CreateEmployeeDto dto) {
        EmployeeResponseDto createdEmployee = employeeService.createEmployee(request, dto);
        ApiResponse<EmployeeResponseDto> response = ApiResponse.success(createdEmployee, "Tạo nhân viên thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> updateEmployee(
            HttpServletRequest request,
            @PathVariable String id,
            @RequestBody @Valid UpdateEmployeeDto dto) {
        EmployeeResponseDto updatedEmployee = employeeService.updateEmployee(request, id, dto);
        ApiResponse<EmployeeResponseDto> response = ApiResponse.success(updatedEmployee, "Cập nhật nhân viên thành công");
        return ResponseEntity.ok(response);
    }
}
