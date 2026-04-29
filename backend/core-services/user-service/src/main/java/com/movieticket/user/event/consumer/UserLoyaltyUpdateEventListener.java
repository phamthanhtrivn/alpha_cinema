package com.movieticket.user.event.consumer;

import com.movieticket.user.entity.Customer;
import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.event.model.UserLoyaltyUpdateEvent;
import com.movieticket.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserLoyaltyUpdateEventListener {
    private static final String TOPIC = "user-loyalty-events";

    private final CustomerRepository customerRepository;

    @Transactional
    @KafkaListener(
            topics = TOPIC,
            groupId = "user-service"
    )
    public void consume(UserLoyaltyUpdateEvent event) {
        if (event == null || event.getCustomerId() == null) {
            System.out.println("Sự kiện không hợp lệ: " + event);
            return;
        }

        Customer customer = customerRepository.findById(event.getCustomerId()).orElse(null);

        if (customer == null) {
            System.err.println("Không tìm thấy khách hàng: " + event.getCustomerId());
            return;
        }

        double totalSpendingNew =
                customer.getTotalSpending() + event.getOrderSpending();

        customer.setTotalSpending(totalSpendingNew);

        double rate;
        CustomerType type;

        if (totalSpendingNew < 2_000_000) {
            rate = 0.03;
            type = CustomerType.MEMBER;
        } else if (totalSpendingNew < 4_000_000) {
            rate = 0.05;
            type = CustomerType.SILVER;
        } else {
            rate = 0.07;
            type = CustomerType.GOLD;
        }

        customer.setCustomerType(type);

        int earnedPoints = (int) Math.round(event.getOrderSpending() * rate / 1000L) ;

        int currentPoints = customer.getLoyaltyPoint();

        int pointsNew =
                currentPoints
                        - event.getPointsUsed()
                        + earnedPoints;

        customer.setLoyaltyPoint(pointsNew);

        customerRepository.save(customer);
    }
}
