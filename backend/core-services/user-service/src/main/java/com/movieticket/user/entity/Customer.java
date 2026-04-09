package com.movieticket.user.entity;

import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "customers")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Customer extends User {
    @Column(columnDefinition = "INT DEFAULT 0")
    private int loyaltyPoint;
    @Column(columnDefinition = "DOUBLE DEFAULT 0")
    private double totalSpending;

    @Enumerated(EnumType.STRING)
    private CustomerType customerType;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Review> reviews;

    public Customer(String fullName, Gender gender, String email, String password, Boolean status, CustomerType customerType) {
        this.fullName = fullName;
        this.gender = gender;
        this.email = email;
        this.password = password;
        this.status = status;
        this.customerType = customerType;
    }
}
