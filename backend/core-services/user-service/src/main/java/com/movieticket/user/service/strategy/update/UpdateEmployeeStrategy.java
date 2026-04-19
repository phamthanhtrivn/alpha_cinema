package com.movieticket.user.service.strategy.update;

import com.movieticket.user.dto.request.UpdateEmployeeDto;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.enums.EmployeeRole;

public interface UpdateEmployeeStrategy {
    EmployeeRole getSupportedRole();
    void update(Employee existing, UpdateEmployeeDto dto);
}
