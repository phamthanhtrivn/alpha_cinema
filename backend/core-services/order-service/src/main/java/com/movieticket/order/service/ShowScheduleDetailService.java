package com.movieticket.order.service;

import com.movieticket.order.dto.request.CreateShowScheduleDetailRequestDto;
import com.movieticket.order.dto.request.SeatRequestDto;
import com.movieticket.order.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ShowScheduleDetailService {
    private static final long SEAT_LOCK_MINUTES = 10L;

    private final RedisTemplate<String, Object> redisTemplate;

    public void lockSeats(String sessionId, CreateShowScheduleDetailRequestDto dto) {
        for (SeatRequestDto seat : dto.getSeats()) {
            String key = buildSeatLockKey(dto.getShowScheduleId(), seat.getSeatId());

            Boolean success = redisTemplate.opsForValue()
                    .setIfAbsent(key, sessionId, SEAT_LOCK_MINUTES, TimeUnit.MINUTES);

            if (!Boolean.TRUE.equals(success)) {
                throw new BusinessException("Ghế bị khóa tạm thời do có người khác đang chọn");
            }
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

    private String buildSeatLockKey(String showScheduleId, String seatId) {
        return "seat:lock:" + showScheduleId + ":" + seatId;
    }
}
