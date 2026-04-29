package com.movieticket.order.service;

import com.movieticket.order.repository.ShowScheduleDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowScheduleDetailService {
    private final ShowScheduleDetailRepository showScheduleDetailRepository;

    public Map<String, String> getBookedSeatMap(String showScheduleId) {
        List<Object[]> results = showScheduleDetailRepository.findBookedSeatsInternal(showScheduleId);

        return results.stream().collect(Collectors.toMap(
                row -> (String) row[0],
                row -> row[1].toString()
        ));
    }
}
