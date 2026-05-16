package com.movieticket.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
record ApiEnvelope<T>(
        boolean success,
        String message,
        T data
) {
}
