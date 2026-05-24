package com.movieticket.user.utils.mapper;

import com.movieticket.user.dto.request.CustomerUpdateProfileDTO;
import com.movieticket.user.dto.response.CustomerProfileDTO;
import com.movieticket.user.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CustomerMapper {
    CustomerProfileDTO toProfileDTO(Customer customer);

    void updateCustomerProfileFromDto(CustomerUpdateProfileDTO dto, @MappingTarget Customer customer);
}
