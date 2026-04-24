package com.movieticket.ticket.service;

import com.movieticket.ticket.dto.request.CreateHolidayDto;
import com.movieticket.ticket.dto.request.SearchHolidayDto;
import com.movieticket.ticket.dto.request.UpdateHolidayDto;
import com.movieticket.ticket.entity.Holiday;
import com.movieticket.ticket.exception.BusinessException;
import com.movieticket.ticket.repository.HolidayRepository;
import com.movieticket.ticket.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HolidayService {
    private final HolidayRepository holidayRepository;

    public Page<Holiday> getAllHolidays(SearchHolidayDto searchHolidayDto, Pageable pageable) {
        return holidayRepository.getAllHolidays(
                searchHolidayDto.getId(),
                searchHolidayDto.getName(),
                searchHolidayDto.getStartDateFrom(),
                searchHolidayDto.getStartDateTo(),
                searchHolidayDto.getEndDateFrom(),
                searchHolidayDto.getEndDateTo(),
                searchHolidayDto.getStatus(),
                pageable
        );
    }

    public Holiday getHolidayById(String id) {
        return holidayRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy ngày lễ với id: " + id));
    }

    public Holiday createHoliday(CreateHolidayDto createHolidayDto) {
        if (holidayRepository.existsByStartDateAndEndDate(createHolidayDto.getStartDate(), createHolidayDto.getEndDate())) {
            throw new BusinessException("Ngày lễ đã tồn tại");
        }

        if (createHolidayDto.getStartDate().isAfter(createHolidayDto.getEndDate())) {
            throw new BusinessException("Ngày bắt đầu không được sau ngày kết thúc");
        }

        Holiday holiday = new Holiday();
        holiday.setId(IdGenerator.generateHolidayId());
        holiday.setName(createHolidayDto.getName());
        holiday.setStartDate(createHolidayDto.getStartDate());
        holiday.setEndDate(createHolidayDto.getEndDate());
        holiday.setDescription(createHolidayDto.getDescription());
        holiday.setStatus(true);

        return holidayRepository.save(holiday);
    }

    public void deleteHoliday(String id) {
        Holiday holiday = getHolidayById(id);
        holidayRepository.delete(holiday);
    }

    public Holiday updateHoliday(String id, UpdateHolidayDto updateHolidayDto) {
        Holiday existingHoliday = getHolidayById(id);

        if (holidayRepository.existsByStartDateAndEndDateAndIdNot(updateHolidayDto.getStartDate(), updateHolidayDto.getEndDate(), id)) {
            throw new BusinessException("Ngày lễ đã tồn tại");
        }

        if (updateHolidayDto.getStartDate().isAfter(updateHolidayDto.getEndDate())) {
            throw new BusinessException("Ngày bắt đầu không được sau ngày kết thúc");
        }

        existingHoliday.setName(updateHolidayDto.getName());
        existingHoliday.setStartDate(updateHolidayDto.getStartDate());
        existingHoliday.setEndDate(updateHolidayDto.getEndDate());
        existingHoliday.setDescription(updateHolidayDto.getDescription());
        existingHoliday.setStatus(updateHolidayDto.isStatus());

        return holidayRepository.save(existingHoliday);
    }

}
