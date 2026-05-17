package com.movieticket.ai.dto.response;

public record PolicySyncResponse(
        int policyCount,
        int chunkCount
) {
}
