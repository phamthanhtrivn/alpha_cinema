package com.movieticket.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "customers")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends User {
    private int loyaltyPoint;
    private double totalSpending;

    @Enumerated(EnumType.STRING)
    private CustomerType customerType;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Review> reviews;
}
