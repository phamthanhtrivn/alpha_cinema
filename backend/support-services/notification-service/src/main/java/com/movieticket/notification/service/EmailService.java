package com.movieticket.notification.service;

import com.movieticket.notification.event.model.OrderProductItem;
import com.movieticket.notification.event.model.OrderSuccessfulEvent;
import com.movieticket.notification.event.model.SendOTPEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public boolean sendOrderSuccessfulEmail(OrderSuccessfulEvent event) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // QUAN TRỌNG: Phải có true để hỗ trợ đính kèm ảnh Inline (CID)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(event.getCustomerEmail());
            helper.setSubject("🎬 Vé xem phim #" + event.getOrderId() + " đã xác nhận thành công");

            // 1. Tạo nội dung HTML
            String htmlContent = buildOrderSuccessfulEmailHtml(event);
            helper.setText(htmlContent, true);

            // 2. Tạo hình ảnh QR code và đính kèm vào email với ID là "qrCodeImage"
            byte[] qrCodeImage = generateQRCodeImage(event.getOrderId());
            if (qrCodeImage != null) {
                helper.addInline("qrCodeImage", new org.springframework.core.io.ByteArrayResource(qrCodeImage), "image/png");
            }

            mailSender.send(message);
            return true;

        } catch (MessagingException ex) {
            System.err.println("Gửi email thất bại: " + ex.getMessage());
            return false;
        }
    }

    private String buildOrderSuccessfulEmailHtml(OrderSuccessfulEvent event) {

        List<String> seatLabels = event.getSeatLabels() == null
                ? Collections.emptyList()
                : event.getSeatLabels();

        List<OrderProductItem> productItems = event.getProductItems() == null
                ? Collections.emptyList()
                : event.getProductItems();

        String seats = seatLabels.isEmpty()
                ? "Không có thông tin"
                : String.join(", ", seatLabels);

        StringBuilder html = new StringBuilder();

        html.append("<!DOCTYPE html>")
                .append("<html><head><meta charset='UTF-8'></head>")
                .append("<body style='background:#f4f6f8;font-family:Arial;'>")

                // CONTAINER
                .append("<div style='max-width:600px;margin:20px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 5px 25px rgba(0,0,0,0.15);'>")

                // HEADER
                .append("<div style='background:#034EA2;color:#fff;text-align:center;padding:20px;'>")
                .append("<h2 style='margin:0;'>🎬 ALPHA CINEMA</h2>")
                .append("<p style='margin:5px 0 0;font-size:13px;'>Vé điện tử</p>")
                .append("</div>")

                // STATUS
                .append("<div style='text-align:center;padding:15px;'>")
                .append("<span style='background:#28a745;color:#fff;padding:6px 18px;border-radius:20px;font-size:12px;'>ĐÃ THANH TOÁN ✓</span>")
                .append("</div>")

                // CONTENT
                .append("<div style='padding:20px;'>")

                .append("<h2 style='color:#034EA2;margin-top:0;text-align:center;'>")
                .append(escape(event.getMovieTitle()))
                .append("</h2>")

                .append("<table style='width:100%;font-size:14px;line-height:1.8;'>")

                .append("<tr><td><b>Mã đơn:</b></td><td>")
                .append(event.getOrderId())
                .append("</td></tr>")

                .append("<tr><td><b>Rạp chiếu:</b></td><td>")
                .append(nullToText(event.getCinemaName()))
                .append("</td></tr>")

                .append("<tr><td><b>Địa chỉ:</b></td><td>")
                .append(nullToText(event.getCinemaAddress()))
                .append("</td></tr>")

                .append("<tr><td><b>Phòng chiếu:</b></td><td>")
                .append(event.getRoomNumber())
                .append("</td></tr>")

                .append("<tr><td><b>Ghế:</b></td><td>")
                .append(seats)
                .append("</td></tr>")

                .append("<tr><td><b>Suất chiếu:</b></td><td>")
                .append(buildShowTimeText(event))
                .append("</td></tr>")

                .append("</table><hr>")

                // THANH TOÁN
                .append("<div style='background:#f7f9fc;padding:15px;border-radius:10px;border:1px solid #e6eaf0;'>")

                .append("<p><b>Tạm tính:</b> ")
                .append(formatCurrency(event.getTotalPrice()))
                .append("</p>")

                .append("<p><b>Giảm giá:</b> -")
                .append(formatCurrency(event.getPointDiscount() + event.getPromotionDiscount()))
                .append("</p>")

                .append("<p style='font-size:18px;color:#034EA2;'><b>Thanh toán:</b> ")
                .append(formatCurrency(event.getTotalPayment()))
                .append("</p>")

                .append("</div>");

        // ĐỒ ĂN
        if (!productItems.isEmpty()) {
            html.append("<h4 style='margin-top:20px;color:#034EA2;'>🍿 Đồ ăn & nước uống</h4>")
                    .append("<table style='width:100%;border-collapse:collapse;font-size:13px;'>")
                    .append("<tr>")
                    .append("<th style='border:1px solid #ddd;padding:6px;'>Sản phẩm</th>")
                    .append("<th style='border:1px solid #ddd;padding:6px;'>SL</th>")
                    .append("<th style='border:1px solid #ddd;padding:6px;'>Giá</th>")
                    .append("<th style='border:1px solid #ddd;padding:6px;'>Thành tiền</th>")
                    .append("</tr>");

            for (OrderProductItem item : productItems) {
                html.append("<tr>")
                        .append("<td style='border:1px solid #ddd;padding:6px;'>")
                        .append(nullToText(item.getProductName()))
                        .append("</td>")
                        .append("<td style='border:1px solid #ddd;padding:6px;text-align:center;'>")
                        .append(item.getQuantity())
                        .append("</td>")
                        .append("<td style='border:1px solid #ddd;padding:6px;text-align:right;'>")
                        .append(formatCurrency(item.getPrice()))
                        .append("</td>")
                        .append("<td style='border:1px solid #ddd;padding:6px;text-align:right;'>")
                        .append(formatCurrency(item.getSubTotal()))
                        .append("</td>")
                        .append("</tr>");
            }

            html.append("</table>");
        }

         // 2. Nhúng trực tiếp vào thẻ img
        html.append("<div style='text-align:center; margin-top:30px; padding:20px; background:#f9f9f9; border-radius:15px;'>")
                .append("<p style='margin:0 0 15px 0; color:#333; font-size:16px;'><b>Mã QR vé điện tử</b></p>")

                // Khối chứa mã QR
                .append("<div style='display:inline-block; padding:15px; background:#fff; border:1px solid #ddd; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05);'>")
                .append("<img src='cid:qrCodeImage' alt='QR Code' style='display:block; width:200px; height:200px;' />")
                .append("</div>")

                // Thông tin mã đơn phía dưới
                .append("<div style='margin-top:15px;'>")
                .append("<span style='display:block; font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;'>Mã đơn hàng</span>")
                .append("<b style='font-size:14px; color:#034EA2; font-family:monospace;'>").append(event.getOrderId()).append("</b>")
                .append("</div>")

                // Dòng ghi chú nhỏ
                .append("<p style='font-size:12px; color:#e50914; margin-top:10px; font-style:italic;'>* Vui lòng đưa mã này cho nhân viên tại quầy vé</p>")
                .append("</div>")

                // FOOTER
                .append("<div style='background:#034EA2;text-align:center;padding:15px;font-size:12px;color:#fff;margin-top:20px;'>")
                .append("Vui lòng xuất trình mã QR tại quầy soát vé<br/>Chúc bạn xem phim vui vẻ 🎬🍿")
                .append("</div>")

                .append("</div></body></html>");

        return html.toString();
    }

    private byte[] generateQRCodeImage(String text) {
        try {
            com.google.zxing.qrcode.QRCodeWriter qrCodeWriter = new com.google.zxing.qrcode.QRCodeWriter();
            // Kích thước 250x250 là chuẩn nhất để quét
            com.google.zxing.common.BitMatrix bitMatrix = qrCodeWriter.encode(text, com.google.zxing.BarcodeFormat.QR_CODE, 250, 250);

            java.io.ByteArrayOutputStream pngOutputStream = new java.io.ByteArrayOutputStream();
            com.google.zxing.client.j2se.MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            System.err.println("Lỗi tạo QR: " + e.getMessage());
            return null;
        }
    }

    private String buildShowTimeText(OrderSuccessfulEvent event) {
        if (event.getShowStartTime() == null) return "Không có thông tin";

        String start = formatDateTime(event.getShowStartTime());
        String end = event.getShowEndTime() != null ? formatDateTime(event.getShowEndTime()) : null;

        String result = end == null ? start : start + " - " + end;

        if (event.getTranslationType() != null)
            result += " (" + event.getTranslationType() + ")";

        if (event.getProjectionType() != null)
            result += " [" + event.getProjectionType() + "]";

        return escape(result);
    }

    private String formatDateTime(LocalDateTime time) {
        return time.format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));
    }

    private String formatCurrency(double value) {
        return String.format("%,.0f đ", value);
    }

    private String nullToText(String value) {
        return (value == null || value.isBlank()) ? "Không có thông tin" : escape(value);
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    //Thanh Tuấn
    public boolean sendOTPEmail(SendOTPEvent event) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(event.getUserEmail());
            helper.setSubject(event.getSubject());

            String htmlContent = buildOtpEmailHtml(event.getContent());

            helper.setText(htmlContent, true);

            mailSender.send(message);
            return true;

        } catch (MessagingException ex) {
            System.err.println("Gửi OTP thất bại: " + ex.getMessage());
            return false;
        }
    }
    private String buildOtpEmailHtml(String otp) {
        return "<div style='font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd;'>" +
                "<h2 style='color: #e50914;'>🎬 ALPHA CINEMA</h2>" +
                "<p>Bạn đang thực hiện thay đổi thông tin tài khoản.</p>" +
                "<p>Mã xác thực của bạn là:</p>" +
                "<h1 style='color: #333; letter-spacing: 5px; background: #f4f4f4; padding: 10px; display: inline-block;'>" + otp + "</h1>" +
                "<p style='color: #888; font-size: 12px;'>Mã này có hiệu lực trong 5 phút. Vui lòng không cung cấp mã này cho bất kỳ ai.</p>" +
                "</div>";
    }
}