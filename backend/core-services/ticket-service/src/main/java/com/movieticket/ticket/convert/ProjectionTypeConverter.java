package com.movieticket.ticket.convert;

import com.movieticket.ticket.enums.ProjectionType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class ProjectionTypeConverter implements Converter<String, ProjectionType> {

    @Override
    public ProjectionType convert(String source) {
        if (source == null) return null;

        return switch (source.toUpperCase()) {
            case "2D" -> ProjectionType._2D;
            case "3D" -> ProjectionType._3D;
            case "IMAX" -> ProjectionType.IMAX;
            default -> throw new IllegalArgumentException("Invalid projection type: " + source);
        };
    }
}
