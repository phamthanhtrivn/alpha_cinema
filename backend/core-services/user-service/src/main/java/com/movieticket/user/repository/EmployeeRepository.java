package com.movieticket.user.repository;

import com.movieticket.user.entity.Employee;
import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    @Query("SELECT e FROM Employee e " +
            "WHERE (:cinemaId IS NULL OR e.cinemaId = :cinemaId) " +
            "AND (:id IS NULL OR e.id = :id) " +
            "AND (:fullName IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :fullName, '%')) ) " +
            "AND (:email IS NULL OR e.email LIKE %:email%) " +
            "AND (:phone IS NULL OR e.phone LIKE %:phone%) " +
            "AND (:gender IS NULL OR e.gender = :gender) " +
            "AND (:status IS NULL OR e.status = :status) " +
            "AND (:role IS NULL OR e.role = :role)")
    Page<Employee> searchAllEmployees(
            @Param("cinemaId") String cinemaId,
            @Param("id") String id,
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("gender") Gender gender,
            @Param("status") Boolean status,
            @Param("role") EmployeeRole role,
            Pageable pageable
    );
}
