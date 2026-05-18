package com.movieticket.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
record PageEnvelope<T>(
        List<T> content
) {
}
