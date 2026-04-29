package com.movieticket.product.dto.client;

import com.movieticket.product.enums.ProjectionType;
import com.movieticket.product.enums.TranslationType;

import java.time.LocalDateTime;

public interface ShowScheduleView {
    String getId();
    LocalDateTime getStartTime();
    ProjectionType getProjectionType();
    TranslationType getTranslationType();
    String getCinemaId();
}
