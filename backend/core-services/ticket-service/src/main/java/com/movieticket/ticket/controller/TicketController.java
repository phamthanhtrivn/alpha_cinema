package com.movieticket.ticket.controller;

import com.movieticket.ticket.common.ApiResponse;
import com.movieticket.ticket.dto.CreateTicketPriceDto;
import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketPrice>> createTicketPrice(@Valid @RequestBody CreateTicketPriceDto createTicketPriceDto) {
        TicketPrice createdPrice = ticketService.createTicketPrice(createTicketPriceDto);
        ApiResponse<TicketPrice> response = ApiResponse.success(createdPrice, "Ticket price created successfully");
        return ResponseEntity.ok(response);
    }
}
