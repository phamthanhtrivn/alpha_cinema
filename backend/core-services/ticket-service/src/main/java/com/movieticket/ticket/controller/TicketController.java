package com.movieticket.ticket.controller;

import com.movieticket.ticket.common.ApiResponse;
import com.movieticket.ticket.dto.*;
import com.movieticket.ticket.entity.Holiday;
import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.service.HolidayService;
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
    public ResponseEntity<ApiResponse<TicketPrice>> determineTicketPrice(@Valid @ModelAttribute DetermineTicketPriceDto determineDto) {
        TicketPrice ticketPrice = ticketService.resolveTicketPrice(determineDto);
        ApiResponse<TicketPrice> response = ApiResponse.success(ticketPrice, "Ticket price determined successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/holidays")
    public ResponseEntity<ApiResponse<Page<Holiday>>> getHolidays(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @ModelAttribute SearchHolidayDto searchHolidayDto
    ) {
        Page<Holiday> holidays = holidayService.getAllHolidays(searchHolidayDto, PageRequest.of(page, size));
        ApiResponse<Page<Holiday>> response = ApiResponse.success(holidays, "Holidays retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/holidays/{id}")
    public ResponseEntity<ApiResponse<Holiday>> getHolidayById(@PathVariable String id) {
        Holiday holiday = holidayService.getHolidayById(id);
        ApiResponse<Holiday> response = ApiResponse.success(holiday, "Holiday retrieved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/holidays")
    public ResponseEntity<ApiResponse<Holiday>> createHoliday(@Valid @RequestBody CreateHolidayDto createHolidayDto) {
        Holiday createdHoliday = holidayService.createHoliday(createHolidayDto);
        ApiResponse<Holiday> response = ApiResponse.success(createdHoliday, "Holiday created successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable String id) {
        holidayService.deleteHoliday(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Holiday deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/holidays/{id}")
    public ResponseEntity<ApiResponse<Holiday>> updateHolidayTicketPrice(
            @PathVariable String id,
            @Valid @RequestBody UpdateHolidayDto updateDto) {
        Holiday updatedHoliday = holidayService.updateHoliday(id, updateDto);
        ApiResponse<Holiday> response = ApiResponse.success(updatedHoliday, "Holiday updated successfully");
        return ResponseEntity.ok(response);
    }

}
