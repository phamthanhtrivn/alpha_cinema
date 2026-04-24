package com.movieticket.ticket.controller;

import com.movieticket.ticket.common.ApiResponse;
import com.movieticket.ticket.dto.request.CreateTicketPriceDto;
import com.movieticket.ticket.dto.request.DetermineTicketPriceDto;
import com.movieticket.ticket.dto.request.SearchTicketPriceDto;
import com.movieticket.ticket.dto.request.UpdateTicketPriceDto;
import com.movieticket.ticket.dto.response.TicketResponseDto;
import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.service.HolidayService;
import com.movieticket.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;
    private final HolidayService holidayService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TicketPrice>>> getAllTicketPrices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @ModelAttribute SearchTicketPriceDto searchDto
            ) {
        Page<TicketPrice> ticketPrices = ticketService.getAllTicketPrices(searchDto, PageRequest.of(page, size));
        ApiResponse<Page<TicketPrice>> response = ApiResponse.success(ticketPrices, "Ticket prices retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketPrice>> getTicketPriceById(@PathVariable String id) {
        TicketPrice ticketPrice = ticketService.getTicketPriceById(id);
        ApiResponse<TicketPrice> response = ApiResponse.success(ticketPrice, "Ticket price retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<TicketPrice>>> getTicketPricesByIds(@RequestBody List<String> ids) {
        List<TicketPrice> ticketPrices = ticketService.getTicketPricesByIds(ids);
        ApiResponse<List<TicketPrice>> response = ApiResponse.success(ticketPrices, "Ticket prices retrieved successfully");
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

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketPrice>> updateTicketPrice(
            @PathVariable String id,
            @Valid @RequestBody UpdateTicketPriceDto updateDto) {
        TicketPrice updatedPrice = ticketService.updateTicketPrice(id, updateDto);
        ApiResponse<TicketPrice> response = ApiResponse.success(updatedPrice, "Ticket price updated successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/determine-ticket-price")
    public ResponseEntity<ApiResponse<TicketResponseDto>> determineTicketPrice(@Valid @ModelAttribute DetermineTicketPriceDto determineDto) {
        TicketResponseDto ticketPrice = ticketService.resolveTicketPrice(determineDto);
        ApiResponse<TicketResponseDto> response = ApiResponse.success(ticketPrice, "Ticket price determined successfully");
        return ResponseEntity.ok(response);
    }
}
