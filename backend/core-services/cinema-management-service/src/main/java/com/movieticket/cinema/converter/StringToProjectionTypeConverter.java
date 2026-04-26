package com.movieticket.cinema.converter;

import com.movieticket.cinema.entity.ProjectionType;
import org.springframework.stereotype.Component;
import org.springframework.core.convert.converter.Converter;

@Component
public class StringToProjectionTypeConverter implements Converter<String, ProjectionType> {
    @Override
    public ProjectionType convert(String source) {
        if (source == null || source.isEmpty()) return null;

        // Thêm dấu gạch dưới nếu nó bắt đầu bằng số (ví dụ: 2D -> _2D)
        String formatted = source.matches("^\\d.*") ? "_" + source : source;

        try {
            return ProjectionType.valueOf(formatted.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Định dạng chiếu không hợp lệ: " + source);
        }
    }
}