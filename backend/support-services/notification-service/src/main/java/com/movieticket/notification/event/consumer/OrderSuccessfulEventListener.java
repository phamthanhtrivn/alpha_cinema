package com.movieticket.notification.event.consumer;

import com.movieticket.notification.event.model.OrderSuccessfulEvent;
import com.movieticket.notification.event.model.SendOTPEvent;
import com.movieticket.notification.service.EmailService;
import com.movieticket.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderSuccessfulEventListener {
    private static final String TOPIC = "order-successful-events";
    private static final String BOOKING_NOTIFICATION_TITLE = "Đặt vé thành công";
    private static final String BOOKING_NOTIFICATION_TYPE = "BOOKING";
    private static final String BOOKING_NOTIFICATION_URL = "/profile?tab=history";

    private final EmailService emailService;
    private final NotificationService notificationService;
    private final RedisTemplate<String, Object> redisTemplate;

    @KafkaListener(
            topics = TOPIC,
            groupId = "notification-service"
    )
    public void consume(OrderSuccessfulEvent event) {
        try {
            if (event == null || event.getCustomerEmail() == null || event.getCustomerEmail().isBlank()) {
                System.err.println("Invalid order successful event: missing customer email");
                return;
            }

            boolean emailSent = emailService.sendOrderSuccessfulEmail(event);
            if (emailSent) {
                createBookingEmailNotification(event);
                deleteCheckoutCache(event);
            }
        } catch (Exception ex) {
            System.err.println("Error processing order successful event: " + ex.getMessage());
            ex.printStackTrace();
        }
    }

    private void createBookingEmailNotification(OrderSuccessfulEvent event) {
        if (event.getCustomerId() == null || event.getCustomerId().isBlank()) {
            System.err.println("Skip booking email notification: missing customer id for order " + event.getOrderId());
            return;
        }

        try {
            notificationService.createNotification(
                    event.getCustomerId(),
                    BOOKING_NOTIFICATION_TITLE,
                    "Email vé cho đơn hàng #" + event.getOrderId()
                            + " đã được gửi thành công đến " + event.getCustomerEmail() + ".",
                    BOOKING_NOTIFICATION_TYPE,
                    BOOKING_NOTIFICATION_URL
            );
        } catch (Exception ex) {
            System.err.println("Failed to save booking email notification for order "
                    + event.getOrderId() + ": " + ex.getMessage());
        }
    }

    private void deleteCheckoutCache(OrderSuccessfulEvent event) {
        if (event.getSessionId() != null && !event.getSessionId().isBlank()) {
            redisTemplate.delete("checkout:session:" + event.getSessionId());
        }
        if (event.getOrderId() != null && !event.getOrderId().isBlank()) {
            redisTemplate.delete("checkout:session:order:" + event.getOrderId());
        }
    }

    //Thanh Tuấn viết ké
    @KafkaListener(topics = "otp-events", groupId = "notification-otp-group")
    public void handleOtp(SendOTPEvent event) {
        boolean isSent = emailService.sendOTPEmail(event);
        if (isSent) {
            System.out.println("OTP đã được gửi thành công đến " + event.getUserEmail());
        } else {
            System.out.println("OTP gửi thất bại " + event.getUserEmail());
        }
    }
}
