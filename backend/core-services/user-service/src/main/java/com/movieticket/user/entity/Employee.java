package com.movieticket.user.entity;

import com.movieticket.user.enums.EmployeeRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employees")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends User {
    @Enumerated(EnumType.STRING)
    private EmployeeRole role;
    private String cinemaId;
}
