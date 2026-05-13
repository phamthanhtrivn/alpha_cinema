package com.movieticket.user.repository;

import com.movieticket.user.dto.request.PasswordInfo;
import com.movieticket.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,String> {
    Optional<User> findByEmailAndStatus(String email, boolean status);
    Optional<User> findByEmail(String email);

    Optional<PasswordInfo> findPasswordInfoById(String id);

    @Modifying
    @Query("UPDATE Customer c SET c.password = :newPassword WHERE c.id = :id")
    void updatePassword(@Param("id") String id, @Param("newPassword") String newPassword);
}
