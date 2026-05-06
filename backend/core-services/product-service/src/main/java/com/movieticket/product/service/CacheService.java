package com.movieticket.product.service;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CacheService {
    private final RedisTemplate<String,String> redisTemplate;

    public Integer getRoomNumberByRoomId(String roomId){
        if(roomId == null) return null;
        String redisKey = "roomId-to-roomNumber:" + roomId;
        String roomNumber = redisTemplate.opsForValue().get(redisKey);
        if(roomNumber == null) return null;
        return Integer.parseInt(roomNumber);
    }
    public void saveRoomIdToRoomNumber(String roomId,Integer roomNumber){
        if(roomId == null || roomNumber == null) return;
        String redisKey = "roomId-to-roomNumber:" + roomId;
        redisTemplate.opsForValue().set(redisKey,roomNumber.toString());
    }
}
