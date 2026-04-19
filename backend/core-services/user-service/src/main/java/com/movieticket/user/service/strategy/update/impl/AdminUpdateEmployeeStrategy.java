package com.movieticket.user.service.strategy.update.impl;

import com.movieticket.user.dto.request.UpdateEmployeeDto;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.service.strategy.update.UpdateEmployeeStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminUpdateEmployeeStrategy implements UpdateEmployeeStrategy {

    @Override
    public EmployeeRole getSupportedRole() {
        return EmployeeRole.ADMIN;
    }

    @Override
    public void update(Employee existing, UpdateEmployeeDto dto) {
        existing.setFullName(dto.getFullName());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        existing.setGender(dto.getGender());
        existing.setDateOfBirth(dto.getDateOfBirth());
        existing.setStatus(dto.getStatus());
        existing.setRole(dto.getRole());
        existing.setCinemaId(dto.getCinemaId());
    }
}