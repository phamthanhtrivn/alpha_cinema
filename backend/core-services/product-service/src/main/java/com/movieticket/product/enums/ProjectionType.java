package com.movieticket.product.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ProjectionType {
    _2D, _3D, IMAX;

    @JsonValue
    public String toJson() {
        return name().startsWith("_") ? name().substring(1) : name();
    }
}
