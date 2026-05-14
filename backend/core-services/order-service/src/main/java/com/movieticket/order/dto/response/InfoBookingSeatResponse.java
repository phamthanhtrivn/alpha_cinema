package com.movieticket.order.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfoBookingSeatResponse {

    private Integer roomNumber;
    private List<Seat> seats;
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Seat {
        private String seatId;
        private String seatNumber;
        private String seatType;
    }

}
