package com.movieticket.user.service;


import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendOtp(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Alpha Cinema Support");
            helper.setTo(toEmail);
            helper.setSubject("[Alpha Cinema] Mã xác thực OTP đặt lại mật khẩu");

            // Tạo nội dung HTML với màu chủ đạo Xanh dương đậm và Trắng
            String htmlContent = String.format(
                    "<div style='font-family: Arial, sans-serif; border: 1px solid #003366; padding: 20px; border-radius: 10px;'>" +
                            "  <h2 style='color: #003366;'>Alpha Cinema</h2>" +
                            "  <p>Chào bạn,</p>" +
                            "  <p>Bạn đang thực hiện yêu cầu đặt lại mật khẩu tại hệ thống rạp phim <b>Alpha Cinema</b>.</p>" +
                            "  <div style='background-color: #003366; color: white; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; border-radius: 5px;'>" +
                            "    <b>%s</b>" +
                            "  </div>" +
                            "  <p style='color: #555; font-size: 13px;'>Mã này sẽ hết hạn sau <b>3 phút</b>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>" +
                            "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                            "  <p style='font-size: 11px; color: #888;'>Hệ thống rạp phim Alpha Cinema - Quận 1, Quận 7, Gò Vấp, Tân Phú, Thủ Đức.</p>" +
                            "</div>",
                    otp
            );

            helper.setText(htmlContent, true); // true nghĩa là gửi định dạng HTML

            mailSender.send(message);
            return true;

        } catch (Exception e) {
            System.err.println("Lỗi gửi mail: " + e.getMessage());
            return false;
        }
    }
}