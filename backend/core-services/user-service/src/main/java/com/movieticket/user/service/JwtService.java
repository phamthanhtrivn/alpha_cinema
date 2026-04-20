package com.movieticket.user.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class JwtService {
    private RedisTemplate<String, Object> redisTemplate;

    public JwtService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void blacklistToken(String token, long expirationMillis){
        redisTemplate.opsForValue().set(
                "blacklist:" + token,
                "true",
                expirationMillis,
                TimeUnit.MILLISECONDS
        );
    }
    // check token có bị blacklist không
    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(
                redisTemplate.hasKey("blacklist:" + token)
        );
    }
}
