package com.movieticket.ticket.service;

import com.movieticket.ticket.dto.CreateTicketPriceDto;
import com.movieticket.ticket.dto.DetermineTicketPriceDto;
import com.movieticket.ticket.dto.SearchTicketPriceDto;
import com.movieticket.ticket.dto.UpdateTicketPriceDto;
import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.exception.BusinessException;
import com.movieticket.ticket.repository.TicketRepository;
import com.movieticket.ticket.util.DayTypeResolver;
import com.movieticket.ticket.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final DayTypeResolver dayTypeResolver;

    public Page<TicketPrice> getAllTicketPrices(SearchTicketPriceDto searchTicketPriceDto, Pageable pageable) {
        return ticketRepository.getAllPrices(
                searchTicketPriceDto.getId(),
                searchTicketPriceDto.getSeatTypeId(),
                searchTicketPriceDto.getProjectionType(),
                searchTicketPriceDto.getDayType(),
                searchTicketPriceDto.getMinPrice(),
                searchTicketPriceDto.getMaxPrice(),
                searchTicketPriceDto.getStatus(),
                pageable
        );
    }

    public TicketPrice getTicketPriceById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Ticket price not found with id: " + id));
    }

    public TicketPrice createTicketPrice(CreateTicketPriceDto createTicketPriceDto) {
        boolean exists = ticketRepository.existsBySeatTypeIdAndProjectionTypeAndDayType(
                createTicketPriceDto.getSeatTypeId(),
                createTicketPriceDto.getProjectionType(),
                createTicketPriceDto.getDayType()
        );

        if (exists) {
            throw new BusinessException("Ticket price already exists for the given seat type, projection type, and day type");
        }

        TicketPrice ticketPrice = new TicketPrice();
        ticketPrice.setId(IdGenerator.generateTicketPriceId());
        ticketPrice.setSeatTypeId(createTicketPriceDto.getSeatTypeId());
        ticketPrice.setProjectionType(createTicketPriceDto.getProjectionType());
        ticketPrice.setDayType(createTicketPriceDto.getDayType());
        ticketPrice.setPrice(createTicketPriceDto.getPrice());
        ticketPrice.setStatus(true);

        return ticketRepository.save(ticketPrice);
    }

    public void deleteTicketPrice(String id) {
        TicketPrice ticketPrice = getTicketPriceById(id);
        ticketRepository.delete(ticketPrice);
    }

    public TicketPrice updateTicketPrice(String id, UpdateTicketPriceDto updateDto) {
        TicketPrice existingPrice = getTicketPriceById(id);

        boolean exists = ticketRepository.existsBySeatTypeIdAndProjectionTypeAndDayTypeAndIdNot(
                updateDto.getSeatTypeId(),
                updateDto.getProjectionType(),
                updateDto.getDayType(),
                id
        );

        if (exists) {
            throw new BusinessException("Giá vé đã tồn tại");
        }

        existingPrice.setSeatTypeId(updateDto.getSeatTypeId());
        existingPrice.setProjectionType(updateDto.getProjectionType());
        existingPrice.setDayType(updateDto.getDayType());
        existingPrice.setPrice(updateDto.getPrice());
        existingPrice.setStatus(updateDto.isStatus());

        return ticketRepository.save(existingPrice);
    }

    public TicketPrice resolveTicketPrice(DetermineTicketPriceDto determineDto) {
        DayType dayType = dayTypeResolver.resolveDayType(determineDto.getShowTime());

        TicketPrice ticketPrice = ticketRepository.findBySeatTypeIdAndProjectionTypeAndDayTypeAndStatus(
                determineDto.getSeatTypeId(),
                determineDto.getProjectionType(),
                dayType,
                true
        );

        if (ticketPrice == null) {
            throw new BusinessException("No active ticket price found for the given criteria");
        }

        return ticketPrice;
    }
}
