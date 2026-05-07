package com.movieticket.user.dto.request;

import com.movieticket.user.utils.Adult;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;

public class AdultValidator implements ConstraintValidator<Adult, LocalDate> {
    private int minAge;

    @Override
    public void initialize(Adult constraintAnnotation) {
        this.minAge = constraintAnnotation.min();
    }

    @Override
    public boolean isValid(LocalDate dateOfBirth, ConstraintValidatorContext context) {
        if (dateOfBirth == null) return false;
        // Tính toán khoảng cách từ ngày sinh đến hiện tại
        return Period.between(dateOfBirth, LocalDate.now()).getYears() >= minAge;
    }
}