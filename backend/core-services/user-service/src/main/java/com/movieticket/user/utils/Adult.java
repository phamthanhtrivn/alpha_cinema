package com.movieticket.user.utils;

import com.movieticket.user.dto.request.AdultValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AdultValidator.class)
@Documented
public @interface Adult {
    String message() default "Người dùng phải trên 14 tuổi";

    int min() default 14;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}