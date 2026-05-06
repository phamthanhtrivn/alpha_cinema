package com.movieticket.cinema.api_response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String timestamp;
    private String message;

    public ApiResponse(boolean success, T data) {
        this.success = success;
        this.data = data;
        this.timestamp = java.time.LocalDateTime.now().toString();
    }
    public ApiResponse(boolean success, String message ) {
        this.success = success;
        this.message = message;
        this.timestamp = java.time.LocalDateTime.now().toString();
    }

}
