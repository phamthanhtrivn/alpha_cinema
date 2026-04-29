package com.movieticket.order.service;

import com.movieticket.order.dto.request.CreateShowScheduleDetailRequestDto;
import com.movieticket.order.dto.request.SeatRequestDto;
import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.repository.ShowScheduleDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowScheduleDetailService {
    private static final long SEAT_LOCK_MINUTES = 10L;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ShowScheduleDetailRepository showScheduleDetailRepository;

    public void ensureSeatsNotBooked(String showScheduleId, List<SeatRequestDto> seats) {
        if (showScheduleId == null || showScheduleId.isBlank() || seats == null || seats.isEmpty()) {
            return;
        }

        List<String> seatIds = seats.stream()
                .map(SeatRequestDto::getSeatId)
                .filter(seatId -> seatId != null && !seatId.isBlank())
                .distinct()
                .toList();

        if (seatIds.isEmpty()) {
            return;
        }

        List<String> reservedSeatIds = showScheduleDetailRepository.findReservedSeatIds(
                showScheduleId,
                seatIds,
                EnumSet.of(OrderStatus.FAILED, OrderStatus.EXPIRED, OrderStatus.CANCELLED)
        );

        if (!reservedSeatIds.isEmpty()) {
            throw new BusinessException("Ghế đã được đặt trong suất chiếu này: " + String.join(", ", reservedSeatIds));
        }
    }

    public void lockSeats(String sessionId, CreateShowScheduleDetailRequestDto dto) {
        List<String> acquiredKeys = new ArrayList<>();
        for (SeatRequestDto seat : dto.getSeats()) {
            String key = buildSeatLockKey(dto.getShowScheduleId(), seat.getSeatId());

            Boolean success = redisTemplate.opsForValue()
                    .setIfAbsent(key, sessionId, SEAT_LOCK_MINUTES, TimeUnit.MINUTES);

            if (!Boolean.TRUE.equals(success)) {
                acquiredKeys.forEach(redisTemplate::delete);
                throw new BusinessException("Ghế bị khóa tạm thời do có người khác đang chọn");
            }
            acquiredKeys.add(key);
        }
    }

    public void validateSeatLocks(String sessionId, CreateShowScheduleDetailRequestDto dto) {
        for (SeatRequestDto seat : dto.getSeats()) {
            String key = buildSeatLockKey(dto.getShowScheduleId(), seat.getSeatId());
            Object lockOwner = redisTemplate.opsForValue().get(key);

            if (lockOwner == null) {
                throw new BusinessException("Thời gian khóa ghế đã hết hạn: " + seat.getSeatId());
            }

            if (!sessionId.equals(lockOwner.toString())) {
                throw new BusinessException("Ghế này đã bị khóa bởi một khách hàng khác: " + seat.getSeatId());
            }
        }
    }

    public void releaseSeatLocks(String sessionId, CreateShowScheduleDetailRequestDto dto) {
        for (SeatRequestDto seat : dto.getSeats()) {
            String key = buildSeatLockKey(dto.getShowScheduleId(), seat.getSeatId());
            Object lockOwner = redisTemplate.opsForValue().get(key);

            if (lockOwner != null && sessionId.equals(lockOwner.toString())) {
                redisTemplate.delete(key);
            }
        }
    }

    public void releaseBookedSeats(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            return;
        }
        showScheduleDetailRepository.deleteByOrder_Id(orderId);
    }

    private String buildSeatLockKey(String showScheduleId, String seatId) {
        return "seat:lock:" + showScheduleId + ":" + seatId;
    }

    public Map<String, String> getBookedSeatMap(String showScheduleId) {
        List<Object[]> results = showScheduleDetailRepository.findBookedSeatsInternal(showScheduleId);

        return results.stream().collect(Collectors.toMap(
                row -> (String) row[0],
                row -> row[1].toString()
        ));
    }
}
