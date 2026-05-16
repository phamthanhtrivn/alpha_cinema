package com.movieticket.ai.dto.tool;

public record CinemaToolResponse(
        String cinemaId,
        String cinemaName,
        String address,
        String city
) {
}
