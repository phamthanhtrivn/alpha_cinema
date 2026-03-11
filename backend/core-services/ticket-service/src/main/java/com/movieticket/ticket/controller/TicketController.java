package com.movieticket.ticket.controller;

import com.movieticket.ticket.common.ApiResponse;
import com.movieticket.ticket.dto.CreateTicketPriceDto;
import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TicketPrice>>> getAllTicketPrices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TicketPrice> ticketPrices = ticketService.getAllTicketPrices(PageRequest.of(page, size));
        ApiResponse<Page<TicketPrice>> response = ApiResponse.success(ticketPrices, "Ticket prices retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketPrice>> getTicketPriceById(@PathVariable String id) {
        TicketPrice ticketPrice = ticketService.getTicketPriceById(id);
        ApiResponse<TicketPrice> response = ApiResponse.success(ticketPrice, "Ticket price retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketPrice>> createTicketPrice(@Valid @RequestBody CreateTicketPriceDto createTicketPriceDto) {
        TicketPrice createdPrice = ticketService.createTicketPrice(createTicketPriceDto);
        ApiResponse<TicketPrice> response = ApiResponse.success(createdPrice, "Ticket price created successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicketPrice(@PathVariable String id) {
        ticketService.deleteTicketPrice(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Ticket price deleted successfully");
        return ResponseEntity.ok(response);
    }
}
