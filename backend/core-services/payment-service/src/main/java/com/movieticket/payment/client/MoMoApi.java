package com.movieticket.payment.client;

import com.movieticket.payment.dto.request.MoMoRequest;
import com.movieticket.payment.dto.response.MoMoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "momo", url = "${momo.end-point}")
public interface MoMoApi {

    @PostMapping("/create")
    MoMoResponse createMoMoQR(@RequestBody MoMoRequest moMoRequest);
}
