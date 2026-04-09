package com.movieticket.user.repository;

import com.movieticket.user.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer,String> {
    boolean existsByEmail(String email);
}
