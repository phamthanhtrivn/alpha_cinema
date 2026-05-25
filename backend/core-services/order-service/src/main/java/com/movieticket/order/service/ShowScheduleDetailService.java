package com.movieticket.order.service;

import com.movieticket.order.dto.ShowScheduleDetailDTO;
import com.movieticket.order.dto.request.CreateShowScheduleDetailRequestDto;
import com.movieticket.order.dto.request.SeatRequestDto;
import com.movieticket.order.entity.OrderStatus;
import com.movieticket.order.entity.ShowScheduleDetail;
import com.movieticket.order.event.model.SeatLockEvent;
import com.movieticket.order.event.producer.SeatLockEventProducer;
import com.movieticket.order.exception.BusinessException;
import com.movieticket.order.repository.ShowScheduleDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowScheduleDetailService {
    private static final long SEAT_LOCK_MINUTES = 10L;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ShowScheduleDetailRepository showScheduleDetailRepository;
    private final SeatLockEventProducer seatLockEventProducer;

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
                throw new BusinessException("Thời gian khóa ghế đã hết hạn");
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

    public void lockSeats(String showScheduleId, List<String> seatIds) {
        List<String> normalizedSeatIds = normalizeSeatIds(seatIds);

        if (showScheduleId == null || showScheduleId.isBlank() || normalizedSeatIds.isEmpty()) {
            return;
        }

        ensureSeatsNotBookedBySeatIds(showScheduleId, normalizedSeatIds);

        List<String> acquiredKeys = new ArrayList<>();
        for (String seatId : normalizedSeatIds) {
            String key = buildSeatLockKey(showScheduleId, seatId);

            Boolean success = redisTemplate.opsForValue()
                    .setIfAbsent(key, "LOCKED", SEAT_LOCK_MINUTES, TimeUnit.MINUTES);

            if (!Boolean.TRUE.equals(success)) {
                acquiredKeys.forEach(redisTemplate::delete);
                throw new BusinessException("Ghế bị khóa tạm thời do có người khác đang chọn");
            }
            acquiredKeys.add(key);
        }

        publishSeatEvent(showScheduleId, normalizedSeatIds, "LOCKED", null, "CHECKOUT_SESSION",
                LocalDateTime.now().plusMinutes(SEAT_LOCK_MINUTES));
    }

    public void unlockSeats(String showScheduleId, List<String> seatIds) {
        List<String> normalizedSeatIds = normalizeSeatIds(seatIds);

        if (showScheduleId == null || showScheduleId.isBlank() || normalizedSeatIds.isEmpty()) {
            return;
        }

        normalizedSeatIds.stream()
                .map(seatId -> buildSeatLockKey(showScheduleId, seatId))
                .forEach(redisTemplate::delete);

        publishSeatEvent(showScheduleId, normalizedSeatIds, "AVAILABLE", null, "SESSION_CANCEL", null);
    }

    private String buildSeatLockKey(String showScheduleId, String seatId) {
        return "seat:lock:" + showScheduleId + ":" + seatId;
    }

    private void ensureSeatsNotBookedBySeatIds(String showScheduleId, List<String> seatIds) {
        List<String> reservedSeatIds = showScheduleDetailRepository.findReservedSeatIds(
                showScheduleId,
                seatIds,
                EnumSet.of(OrderStatus.FAILED, OrderStatus.EXPIRED, OrderStatus.CANCELLED)
        );

        if (!reservedSeatIds.isEmpty()) {
            throw new BusinessException("Ghế đã được đặt trong suất chiếu này: " + String.join(", ", reservedSeatIds));
        }
    }

    private List<String> normalizeSeatIds(List<String> seatIds) {
        if (seatIds == null) {
            return List.of();
        }

        return seatIds.stream()
                .filter(seatId -> seatId != null && !seatId.isBlank())
                .distinct()
                .toList();
    }

    public Map<String, String> getBookedSeatMap(String showScheduleId) {
        List<Object[]> results = showScheduleDetailRepository.findBookedSeatsInternal(showScheduleId);

        Map<String, String> bookedSeats = new HashMap<>(results.stream().collect(Collectors.toMap(
                row -> (String) row[0],
                row -> row[1].toString()
        )));

        getLockedSeatIds(showScheduleId).forEach(seatId -> bookedSeats.putIfAbsent(seatId, "LOCKED"));
        return bookedSeats;
    }

    public List<ShowScheduleDetailDTO> getShowScheduleDetailsByShowScheduleId(String showScheduleId) {
        List<ShowScheduleDetail> list =  showScheduleDetailRepository.findByShowScheduleId(showScheduleId);
        return list.stream().map(
                item -> {
                    ShowScheduleDetailDTO dto = new ShowScheduleDetailDTO();
                    dto.setId(item.getId());
                    dto.setShowScheduleId(item.getShowScheduleId());
                    dto.setMovieId(item.getMovieId());
                    dto.setSeatId(item.getSeatId());
                    dto.setShowSeatType(item.getShowSeatType());
                    return dto;
                }
        ).toList();
    }

    private List<String> getLockedSeatIds(String showScheduleId) {
        if (showScheduleId == null || showScheduleId.isBlank()) {
            return List.of();
        }

        String pattern = "seat:lock:" + showScheduleId + ":*";
        try {
            return redisTemplate.keys(pattern)
                    .stream()
                    .map(key -> extractSeatIdFromKey(key, showScheduleId))
                    .filter(seatId -> seatId != null && !seatId.isBlank())
                    .distinct()
                    .toList();
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private String extractSeatIdFromKey(String key, String showScheduleId) {
        String prefix = "seat:lock:" + showScheduleId + ":";
        if (key != null && key.startsWith(prefix)) {
            return key.substring(prefix.length());
        }
        return null;
    }

    private void publishSeatEvent(
            String showScheduleId,
            List<String> seatIds,
            String status,
            String sessionId,
            String source,
            LocalDateTime expiresAt
    ) {
        if (seatIds == null || seatIds.isEmpty()) {
            return;
        }

        seatLockEventProducer.publish(SeatLockEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .showScheduleId(showScheduleId)
                .seatIds(seatIds)
                .status(status)
                .sessionId(sessionId)
                .source(source)
                .expiresAt(expiresAt)
                .occurredAt(LocalDateTime.now())
                .build());
    }
}
