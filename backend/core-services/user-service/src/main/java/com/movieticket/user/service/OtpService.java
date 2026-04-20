package com.movieticket.user.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {
    private RedisTemplate<String,Object> redisTemplate;
    public OtpService(RedisTemplate<String,Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    public String generateOtp(String email){
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        redisTemplate.opsForValue().set(
                "otp:" + email,
                otp,
                3,
                TimeUnit.MINUTES
        );

        return otp;
    }
    public boolean validateOtp(String email,String otp){
        String storeOtp = (String) redisTemplate.opsForValue().get("otp:" + email);
        if(storeOtp == null) return  false;
        return otp.equals(storeOtp);
    }
}
