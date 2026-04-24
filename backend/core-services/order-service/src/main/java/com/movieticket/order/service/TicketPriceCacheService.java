package com.movieticket.order.service;

import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.model.cache.TicketPriceCache;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketPriceCacheService {
    private final CheckoutPartnerGateway checkoutPartnerGateway;

    public Map<String, TicketPriceCache> getTicketPrices(List<String> ticketPriceIds) {
        if (ticketPriceIds == null || ticketPriceIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, TicketPriceCache> ticketPrices = checkoutPartnerGateway.getTicketPrices(ticketPriceIds);
        for (String ticketPriceId : ticketPriceIds) {
            TicketPriceCache ticketPrice = ticketPrices.get(ticketPriceId);
            if (ticketPrice == null || ticketPrice.getPrice() == null) {
                throw new BusinessException("Giá vé không tồn tại với id: " + ticketPriceId);
            }
        }
        return ticketPrices;
    }
}
