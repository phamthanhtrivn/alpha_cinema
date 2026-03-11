package com.movieticket.ticket.service;

import com.movieticket.ticket.dto.CreateTicketPriceDto;
import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.exception.BusinessException;
import com.movieticket.ticket.repository.TicketRepository;
import com.movieticket.ticket.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;

    public Page<TicketPrice> getAllTicketPrices(Pageable pageable) {
        return ticketRepository.getAllPrices(pageable);
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


}
