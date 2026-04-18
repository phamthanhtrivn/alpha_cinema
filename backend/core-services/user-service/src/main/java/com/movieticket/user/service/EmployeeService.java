package com.movieticket.user.service;

import com.movieticket.user.dto.request.SearchEmployeeDto;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.repository.EmployeeRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public Page<Employee> getAllEmployees(HttpServletRequest request, SearchEmployeeDto searchEmployeeDto, Pageable pageable) {
        String employeeId = request.getHeader("X-User-Id");

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            throw new BusinessException("Employee not found with id: " + employeeId);
        }

        String cinemaId = null;
        if (!"ADMIN".equals(employee.getRole().toString())) {
            cinemaId = employee.getCinemaId();
        }

        return employeeRepository.searchAllEmployees(
                cinemaId,
                searchEmployeeDto.getId(),
                searchEmployeeDto.getFullName(),
                searchEmployeeDto.getEmail(),
                searchEmployeeDto.getPhone(),
                searchEmployeeDto.getGender(),
                searchEmployeeDto.getStatus(),
                searchEmployeeDto.getRole(),
                pageable
        );
    }

}
