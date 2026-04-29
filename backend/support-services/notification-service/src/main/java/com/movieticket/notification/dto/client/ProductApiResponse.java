package com.movieticket.notification.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Object errors;
    private String timestamp;
}
