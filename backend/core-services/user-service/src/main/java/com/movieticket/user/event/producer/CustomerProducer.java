package com.movieticket.user.event.producer;

import com.movieticket.user.event.model.SendOTPEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "otp-events";

    public void sendOtpEmail(SendOTPEvent event) {
        try {
            log.info("Đang gửi OTP Event sang Kafka cho email: {}", event.getUserEmail());

            kafkaTemplate.send(TOPIC, event);

            log.info("Đã gửi thành công lên topic: {}", TOPIC);
        } catch (Exception e) {
            log.error("Lỗi khi gửi message sang Kafka: {}", e.getMessage());
            throw new RuntimeException("Không thể kết nối với hệ thống gửi tin nhắn");
        }
    }
}
