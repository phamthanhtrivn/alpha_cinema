package com.movieticket.user.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class JwtService {
    private RedisTemplate<String, Object> redisTemplate;
    private static final String USER_BLACKLIST_PREFIX = "blacklist:user:";

    public JwtService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void addBlackListUserId(String userId){
        redisTemplate.opsForValue().set(USER_BLACKLIST_PREFIX + userId, "block");
    }

    public void deleteBlackListUserId(String userId){
        redisTemplate.delete(USER_BLACKLIST_PREFIX + userId);
    }

    public boolean isUserIdBlackList(String userId){
        return Boolean.TRUE.equals(redisTemplate.hasKey(USER_BLACKLIST_PREFIX + userId));
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
