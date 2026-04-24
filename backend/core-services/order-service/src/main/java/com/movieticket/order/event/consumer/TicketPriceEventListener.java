package com.movieticket.order.event.listener;

import com.movieticket.order.dto.TicketPriceEventDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketPriceEventListener {
    private static final String TOPIC = "ticket-price-events";

    private final RedisTemplate<String, Object> redisTemplate;

    @KafkaListener(topics = TOPIC, groupId = "order-service")
    public void consume(TicketPriceEventDto event) {

        String key = "ticket:price:" + event.getTicketPriceId();

        if (!event.isStatus()) {
            redisTemplate.delete(event.getTicketPriceId());
        }

        TicketPriceCache cache = new TicketPriceCache(
                event.getTicketPriceId(),
                event.getPrice(),
                event.getSeatTypeId(),
                event.getProjectionType(),
                event.getDayType(),
                event.isStatus()
        );

        redisTemplate.opsForValue().set(key, cache);
    }

}
