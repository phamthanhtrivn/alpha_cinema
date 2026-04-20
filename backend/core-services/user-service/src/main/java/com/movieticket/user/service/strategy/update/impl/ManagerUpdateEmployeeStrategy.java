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
public class ManagerUpdateEmployeeStrategy implements UpdateEmployeeStrategy {

    @Override
    public EmployeeRole getSupportedRole() {
        return EmployeeRole.MANAGER;
    }

    @Override
    public void update(Employee existing, UpdateEmployeeDto dto) {
        if (existing.getRole() != EmployeeRole.STAFF) {
            throw new BusinessException("Manager chỉ được update STAFF");
        }

        existing.setFullName(dto.getFullName());
        existing.setPhone(dto.getPhone());
        existing.setGender(dto.getGender());
        existing.setEmail(dto.getEmail());
        existing.setDateOfBirth(dto.getDateOfBirth());
        existing.setStatus(dto.getStatus());
    }
}