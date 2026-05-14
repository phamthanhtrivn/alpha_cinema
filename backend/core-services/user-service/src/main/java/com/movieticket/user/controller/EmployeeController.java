package com.movieticket.user.controller;

import com.movieticket.user.common.ApiResponse;
import com.movieticket.user.dto.request.ChangePasswordDTO;
import com.movieticket.user.dto.request.CreateEmployeeDto;
import com.movieticket.user.dto.request.EmailUpdateReq;
import com.movieticket.user.dto.request.EmailVerifyReq;
import com.movieticket.user.dto.request.EmployeeUpdateProfileDTO;
import com.movieticket.user.dto.request.SearchEmployeeDto;
import com.movieticket.user.dto.request.UpdateEmployeeDto;
import com.movieticket.user.dto.response.EmployeeProfileDTO;
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

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<EmployeeProfileDTO>> getMyProfile(
            @RequestHeader("X-User-Id") String userId
    ) {
        EmployeeProfileDTO profile = employeeService.getEmployeeProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, ""));
    }

    @PostMapping("/update-profile")
    public ResponseEntity<ApiResponse<EmployeeProfileDTO>> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody @Valid EmployeeUpdateProfileDTO updateInformation
    ) {
        EmployeeProfileDTO profile = employeeService.updateEmployeeProfile(userId, updateInformation);
        return ResponseEntity.ok(ApiResponse.success(profile, "Cập nhật thông tin thành công"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody ChangePasswordDTO dto
    ) {
        employeeService.changePassword(userId, dto);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @PostMapping("/email/request-update")
    public ResponseEntity<String> requestUpdate(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody EmailUpdateReq req) {
        employeeService.requestUpdateEmail(userId, req.getNewEmail());
        return ResponseEntity.ok("Mã OTP đã được gửi vào Email mới của bạn");
    }

    @PostMapping("/email/verify-update")
    public ResponseEntity<ApiResponse<String>> verifyUpdate(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody EmailVerifyReq req) {
        String newEmail = employeeService.verifyAndUpdateEmail(userId, req);
        return ResponseEntity.ok(ApiResponse.success(newEmail, "Cập nhật Email thành công!"));
    }
}
