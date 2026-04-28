package com.movieticket.cinema.util;

import java.util.UUID;

public class GenerateID {
    public static String generateCinemaId() {
        return "cinema-" + UUID.randomUUID().toString().substring(0,8);
    }

    public static String generateSeatTypeId() {
        return "seat-type-" + UUID.randomUUID().toString().substring(0,8);
    }
    public static String generateRoomId(String cinemaId) {
        return "room-" + UUID.randomUUID().toString().substring(0,8) + "_" + cinemaId;
    }
    public static String generateSeatId(String roomID) {
        return "seat-" + UUID.randomUUID().toString().substring(0,8) + "_" + roomID;
    }
}
