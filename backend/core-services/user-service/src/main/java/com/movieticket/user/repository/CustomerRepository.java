package com.movieticket.user.repository;

import com.movieticket.user.entity.Customer;
import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    @Query("SELECT c " +
            "FROM Customer c " +
            "WHERE (:fullName IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) " +
            "AND (:email IS NULL OR c.email = :email) " +
            "AND (:phone IS NULL OR c.phone = :phone) " +
            "AND (:gender IS NULL OR c.gender = :gender) " +
            "AND (:status IS NULL OR c.status = :status) " +
            "AND (:customerType IS NULL OR c.customerType = :customerType) " +
            "AND (:minPoints IS NULL OR c.loyaltyPoint >= :minPoints) " +
            "AND (:maxPoints IS NULL OR c.loyaltyPoint <= :maxPoints) " +
            "AND (:minTotalSpending IS NULL OR c.totalSpending >= :minTotalSpending) " +
            "AND (:maxTotalSpending IS NULL OR c.totalSpending <= :maxTotalSpending) ")
    Page<Customer> searchAllCustomers(
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("gender") Gender gender,
            @Param("status") Boolean status,
            @Param("customerType")CustomerType customerType,
            @Param("minPoints") Integer minPoints,
            @Param("maxPoints") Integer maxPoints,
            @Param("minTotalSpending") Double minTotalSpending,
            @Param("maxTotalSpending") Double maxTotalSpending,
            Pageable pageable
    );
}
