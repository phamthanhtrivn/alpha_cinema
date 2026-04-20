package com.movieticket.user.service.strategy.create.impl;

import com.movieticket.user.dto.request.CreateEmployeeDto;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.service.strategy.create.CreateEmployeeStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ManagerCreateEmployeeStrategy implements CreateEmployeeStrategy {

    private final PasswordEncoder passwordEncoder;

    @Override
    public EmployeeRole getSupportedRole() {
        return EmployeeRole.MANAGER;
    }

    @Override
    public Employee create(CreateEmployeeDto dto, Employee creator) {

        if (dto.getRole() != EmployeeRole.STAFF) {
            throw new BusinessException("Manager chỉ được tạo STAFF");
        }

        Employee e = new Employee();

        e.setFullName(dto.getFullName());
        e.setEmail(dto.getEmail());
        e.setPhone(dto.getPhone());
        e.setPassword(passwordEncoder.encode(dto.getEmail() + dto.getEmail()));
        e.setGender(dto.getGender());
        e.setDateOfBirth(dto.getDateOfBirth());
        e.setStatus(true);

        e.setRole(EmployeeRole.STAFF);
        e.setCinemaId(creator.getCinemaId());

        return e;
    }
}