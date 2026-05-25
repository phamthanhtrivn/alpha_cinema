package com.movieticket.user.utils.mapper;

import com.movieticket.user.dto.request.EmployeeUpdateProfileDTO;
import com.movieticket.user.dto.response.EmployeeProfileDTO;
import com.movieticket.user.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {
    EmployeeProfileDTO toProfileDTO(Employee employee);

    void updateEmployeeProfileFromDto(EmployeeUpdateProfileDTO dto, @MappingTarget Employee employee);
}
