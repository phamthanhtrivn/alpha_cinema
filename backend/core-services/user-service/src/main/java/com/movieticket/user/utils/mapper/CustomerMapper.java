package com.movieticket.user.utils.mapper;

import com.movieticket.user.dto.request.CustomerUpdateProfileDTO;
import com.movieticket.user.dto.response.CustomerProfileDTO;
import com.movieticket.user.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerProfileDTO toProfileDTO(Customer customer);

    void updateCustomerProfileFromDto(CustomerUpdateProfileDTO dto, @MappingTarget Customer customer);
}
