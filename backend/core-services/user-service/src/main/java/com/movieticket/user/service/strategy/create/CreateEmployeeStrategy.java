package com.movieticket.user.service.strategy.create;

import com.movieticket.user.dto.request.CreateEmployeeDto;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.enums.EmployeeRole;

public interface CreateEmployeeStrategy {
    EmployeeRole getSupportedRole();
    Employee create(CreateEmployeeDto dto, Employee creator);
}
