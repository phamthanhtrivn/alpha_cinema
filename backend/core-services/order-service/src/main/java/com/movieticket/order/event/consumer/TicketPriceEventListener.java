package com.movieticket.order.event.consumer;

import com.movieticket.order.event.model.TicketPriceEvent;
import com.movieticket.order.model.cache.TicketPriceCache;
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
    public void consume(TicketPriceEvent event) {
        String key = "ticket:price:" + event.getTicketPriceId();

        if (!event.isStatus()) {
            redisTemplate.delete(key);
            return;
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
