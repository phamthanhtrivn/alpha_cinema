package com.movieticket.gateway.utils;


import io.jsonwebtoken.Claims;
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

@Service
public class JwtUtils {

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
    public boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
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

    public String extractUserId(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.get("userId", String.class);
    }

    public String extractCinemaId(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.get("cinemaId", String.class);
    }
}
