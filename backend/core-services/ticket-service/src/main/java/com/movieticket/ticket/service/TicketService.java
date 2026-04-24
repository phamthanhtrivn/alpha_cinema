package com.movieticket.ticket.service;

import com.movieticket.ticket.dto.request.CreateTicketPriceDto;
import com.movieticket.ticket.dto.request.DetermineTicketPriceDto;
import com.movieticket.ticket.dto.request.SearchTicketPriceDto;
import com.movieticket.ticket.dto.request.UpdateTicketPriceDto;
import com.movieticket.ticket.dto.response.TicketResponseDto;
import com.movieticket.ticket.entity.TicketPrice;
import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.event.model.TicketPriceEvent;
import com.movieticket.ticket.event.producer.TicketEventProducer;
import com.movieticket.ticket.exception.BusinessException;
import com.movieticket.ticket.repository.TicketRepository;
import com.movieticket.ticket.util.DayTypeResolver;
import com.movieticket.ticket.util.IdGenerator;
import com.movieticket.ticket.util.TicketUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final DayTypeResolver dayTypeResolver;
    private final TicketEventProducer producer;

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
                .orElseThrow(() -> new BusinessException("Không tìm thấy giá vé với id: " + id));
    }

    public List<TicketPrice> getTicketPricesByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        List<String> distinctIds = ids.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .collect(Collectors.collectingAndThen(Collectors.toCollection(LinkedHashSet::new), List::copyOf));

        if (distinctIds.isEmpty()) {
            return List.of();
        }

        Map<String, TicketPrice> ticketPricesById = ticketRepository.findAllById(distinctIds).stream()
                .collect(Collectors.toMap(TicketPrice::getId, Function.identity()));

        for (String id : distinctIds) {
            if (!ticketPricesById.containsKey(id)) {
                throw new BusinessException("Không tìm thấy giá vé với id: " + id);
            }
        }

        return distinctIds.stream()
                .map(ticketPricesById::get)
                .toList();
    }

    public TicketPrice createTicketPrice(CreateTicketPriceDto createTicketPriceDto) {
        boolean exists = ticketRepository.existsBySeatTypeIdAndProjectionTypeAndDayType(
                createTicketPriceDto.getSeatTypeId(),
                createTicketPriceDto.getProjectionType(),
                createTicketPriceDto.getDayType()
        );

        if (exists) {
            throw new BusinessException("Giá vé đã tồn tại");
        }

        TicketPrice ticketPrice = new TicketPrice();
        ticketPrice.setId(IdGenerator.generateTicketPriceId());
        ticketPrice.setSeatTypeId(createTicketPriceDto.getSeatTypeId());
        ticketPrice.setProjectionType(createTicketPriceDto.getProjectionType());
        ticketPrice.setDayType(createTicketPriceDto.getDayType());
        ticketPrice.setPrice(createTicketPriceDto.getPrice());
        ticketPrice.setStatus(true);

        TicketPrice savedTicketPrice = ticketRepository.save(ticketPrice);

        producer.send(TicketUtil.toTicketPriceEventDto(savedTicketPrice));

        return savedTicketPrice;
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

        TicketPrice updatedPrice = ticketRepository.save(existingPrice);

        producer.send(TicketUtil.toTicketPriceEventDto(updatedPrice));

        return updatedPrice;
    }

    public TicketResponseDto resolveTicketPrice(DetermineTicketPriceDto determineDto) {
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

        return TicketUtil.toTicketResponseDto(ticketPrice);
    }
}
