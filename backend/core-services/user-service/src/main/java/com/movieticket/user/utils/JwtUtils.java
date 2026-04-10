package com.movieticket.user.utils;

import com.movieticket.user.dto.UserResponse;
import com.movieticket.user.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import io.jsonwebtoken.Claims;

@Service
public class JwtUtils {
    private static final long ACCESS_TOKEN_EXPIRATION = 900000; // 15 p
    private static final long RESET_PASSWORD_TOKEN_EXPIRATION = 300000; // 5 p
    private static final long REFRESH_TOKEN_EXPIRATION = 604800000; // 7 ngày

    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    public JwtUtils(
            @Value("${rsa.private-key-path}") Resource privateKeyResource,
            @Value("${rsa.public-key-path}") Resource publicKeyResource
            ) throws Exception {
        String pirvateKeyStr = new String(privateKeyResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String publicKeyStr = new String(publicKeyResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        this.privateKey = KeyReaderUtils.getPrivateKeyFromString(pirvateKeyStr);
        this.publicKey = KeyReaderUtils.getPublicKeyFromString(publicKeyStr);
    }
    private String buildToken(Map<String,Object> claims, String subject, long expiration){
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }
    public String generateAccessToken(UserResponse user){
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        return buildToken(claims, user.getEmail(), ACCESS_TOKEN_EXPIRATION);
    }
    public String generateRefreshToken(UserResponse user){
        return buildToken(new HashMap<>(), user.getEmail(), REFRESH_TOKEN_EXPIRATION);
    }
    public String generateResetPasswordToken(String email){
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "RESET_PASSWORD");
        return buildToken(claims, email, RESET_PASSWORD_TOKEN_EXPIRATION);
    }
    /**
     * Giải mã toàn bộ Token để lấy Claims bằng PUBLIC KEY
     */
    public boolean isResetTokenValid(String token, String email) {
        try {
            final String tokenEmail = extractEmail(token);
            final String role = extractRole(token);
            return tokenEmail.equals(email)
                    && role.equals("RESET_PASSWORD")
                    && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    private Claims extractAllClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
    public boolean isTokenValid(String token, User user) {
        final String email = extractEmail(token);
        return (email.equals(user.getEmail())) && !isTokenExpired(token);
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractRole(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }
}
