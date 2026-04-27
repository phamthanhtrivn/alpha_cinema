package com.movieticket.user.exception;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class BusinessException extends RuntimeException {


    public BusinessException(String message) {
        super(message);
    }


}
