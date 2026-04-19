package com.movieticket.user.service;

import com.movieticket.user.dto.request.CreateEmployeeDto;
import com.movieticket.user.dto.request.SearchEmployeeDto;
import com.movieticket.user.dto.request.UpdateEmployeeDto;
import com.movieticket.user.dto.response.EmployeeResponseDto;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.repository.EmployeeRepository;
import com.movieticket.user.service.strategy.create.CreateEmployeeStrategy;
import com.movieticket.user.service.strategy.create.CreateEmployeeStrategyContext;
import com.movieticket.user.service.strategy.update.UpdateEmployeeStrategy;
import com.movieticket.user.service.strategy.update.UpdateEmployeeStrategyContext;
import com.movieticket.user.utils.EmployeeUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final CreateEmployeeStrategyContext strategyContext;
    private final UpdateEmployeeStrategyContext updateStrategyContext;

    public Page<EmployeeResponseDto> getAllEmployees(HttpServletRequest request,
                                                     SearchEmployeeDto searchEmployeeDto,
                                                     Pageable pageable) {

        String employeeId = request.getHeader("X-User-Id");

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("Employee not found with id: " + employeeId));

        String cinemaId = searchEmployeeDto.getCinemaId();
        EmployeeRole excludeRole = null;

        if (employee.getRole() == EmployeeRole.STAFF) {
            throw new BusinessException("You do not have permission to view employees");
        }

        if (employee.getRole() == EmployeeRole.MANAGER) {
            cinemaId = employee.getCinemaId();
            searchEmployeeDto.setRole(EmployeeRole.STAFF);
        }

        if (employee.getRole() == EmployeeRole.ADMIN) {
            excludeRole = EmployeeRole.ADMIN;
        }

        Page<Employee> employees = employeeRepository.searchAllEmployees(
                excludeRole,
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

        return employees.map(EmployeeUtil::toEmployeeResponseDto);
    }

    public EmployeeResponseDto createEmployee(HttpServletRequest request, CreateEmployeeDto dto) {
        String employeeId = request.getHeader("X-User-Id");

        Employee creator = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("Employee not found"));

        validateCreateEmployee(dto);

        CreateEmployeeStrategy strategy =
                strategyContext.getStrategy(creator.getRole());

        Employee employee = strategy.create(dto, creator);

        Employee savedEmployee = employeeRepository.save(employee);

        return EmployeeUtil.toEmployeeResponseDto(savedEmployee);
    }

    public EmployeeResponseDto updateEmployee(HttpServletRequest request, String id, UpdateEmployeeDto dto) {
        String employeeId = request.getHeader("X-User-Id");

        Employee updater = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("Employee not found"));

        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Employee not found with id: " + id));

        if (existing.getId().equals(updater.getId())) {
            throw new BusinessException("Không được tự update chính mình");
        }

        if (updater.getRole() == EmployeeRole.STAFF) {
            throw new BusinessException("Bạn không có quyền update nhân viên");
        }

        if (updater.getRole() == EmployeeRole.MANAGER) {
            if (!existing.getCinemaId().equals(updater.getCinemaId())) {
                throw new BusinessException("Không cùng rạp");
            }
        }

        validateUpdateEmployee(existing, dto);

        UpdateEmployeeStrategy strategy =
                updateStrategyContext.getStrategy(updater.getRole());

        strategy.update(existing, dto);

        Employee updatedEmployee = employeeRepository.save(existing);

        return EmployeeUtil.toEmployeeResponseDto(updatedEmployee);
    }

    private void validateUpdateEmployee(Employee existing, UpdateEmployeeDto dto) {
        if (employeeRepository.existsByEmailAndIdNot(dto.getEmail(), existing.getId())) {
                throw new BusinessException("Email đã tồn tại");
        }

        if (employeeRepository.existsByPhoneAndIdNot(dto.getPhone(), existing.getId())) {
            throw new BusinessException("SĐT đã tồn tại");
        }
    }

    private void validateCreateEmployee(CreateEmployeeDto dto) {
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email đã tồn tại");
        }

        if (employeeRepository.existsByPhone(dto.getPhone())) {
            throw new BusinessException("SĐT đã tồn tại");
        }
    }
}
