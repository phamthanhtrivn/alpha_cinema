package com.movieticket.product.dto.admin.response;

import lombok.Data;

@Data
public class CinemaServiceResponse<T> {
    private boolean success;
    private T data;
    private String timestamp; // Bên kia dùng String, mình để String cho khớp
    private String message;
}
