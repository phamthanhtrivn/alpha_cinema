package com.movieticket.product.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ProjectionType {
    _2D, _3D, IMAX;

    @JsonValue
    @Override
    public String toString() {
        return name().startsWith("_") ? name().substring(1) : name();
    }
}
