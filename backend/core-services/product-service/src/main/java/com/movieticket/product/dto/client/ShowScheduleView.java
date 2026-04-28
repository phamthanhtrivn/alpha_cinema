package com.movieticket.product.dto.client;

import java.time.LocalDateTime;

public interface ShowScheduleView {
    String getId();
    LocalDateTime getStartTime();
    String getProjectionType();
    String getTranslationType();
    String getCinemaId();
}
