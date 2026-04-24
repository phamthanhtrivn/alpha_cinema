package com.movieticket.payment.client;

import iuh.fit.hotel_booking_backend.dto.MoMoRequest;
import iuh.fit.hotel_booking_backend.dto.MoMoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "momo", url = "${momo.end-point}")
public interface MoMoApi {

    @PostMapping("/create")
    MoMoResponse createMoMoQR(@RequestBody MoMoRequest moMoRequest);
}
