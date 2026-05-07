package com.movieticket.notification.event.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class SendOTPEvent {
    private String userEmail; // Email người nhận
    private String subject;   // Tiêu đề mail
    private String content;   // Nội dung (chứa OTP hoặc nội dung khác)
    private String type;
}
