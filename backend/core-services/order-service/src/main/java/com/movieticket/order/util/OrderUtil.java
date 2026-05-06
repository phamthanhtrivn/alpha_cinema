package com.movieticket.order.util;

import com.movieticket.order.dto.client.ProductSnapshot;
import com.movieticket.order.dto.client.TicketPriceSnapshot;
import com.movieticket.order.model.cache.ProductCache;
import com.movieticket.order.model.cache.TicketPriceCache;

public class OrderUtil {

    public static TicketPriceSnapshot mapToSnapshot(TicketPriceCache cache) {
        if (cache == null) return null;

        return TicketPriceSnapshot.builder()
                .id(cache.getTicketPriceId())
                .price(cache.getPrice())
                .seatTypeId(cache.getSeatTypeId())
                .build();
    }

    public static ProductSnapshot mapToProductSnapshot(ProductCache cache) {
        if (cache == null) return null;

        return ProductSnapshot.builder()
                .id(cache.getProductId())
                .name(cache.getName())
                .pictureUrl(cache.getImageUrl())
                .build();
    }
}
