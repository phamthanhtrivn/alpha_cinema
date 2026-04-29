package com.movieticket.notification.service;

import com.movieticket.notification.event.model.OrderProductItem;
import com.movieticket.notification.event.model.OrderSuccessfulEvent;
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
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(event.getCustomerEmail());
            helper.setSubject("🎬 Vé xem phim #" + event.getOrderId() + " đã xác nhận thành công");

            helper.setText(buildOrderSuccessfulEmailHtml(event), true);

            mailSender.send(message);
            return true;

        } catch (MessagingException ex) {
            System.err.println("Gửi email thất bại: " + ex.getMessage());
            return false;
        }
    }

    // =========================
    // 🎟️ TEMPLATE VÉ (VIỆT HOÁ 100%)
    // =========================
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

        // QR
        html.append("<div style='text-align:center;margin-top:25px;'>")
                .append("<p><b>Mã QR vé điện tử</b></p>")
                .append("<div style='border:2px dashed #034EA2;padding:12px;display:inline-block;border-radius:10px;'>")
                .append(event.getQrCode() == null ? "Đang cập nhật mã QR..." : escape(event.getQrCode()))
                .append("</div>")
                .append("</div>")

                // FOOTER
                .append("<div style='background:#034EA2;text-align:center;padding:15px;font-size:12px;color:#fff;margin-top:20px;'>")
                .append("Vui lòng xuất trình mã QR tại quầy soát vé<br/>Chúc bạn xem phim vui vẻ 🎬🍿")
                .append("</div>")

                .append("</div></body></html>");

        return html.toString();
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
}