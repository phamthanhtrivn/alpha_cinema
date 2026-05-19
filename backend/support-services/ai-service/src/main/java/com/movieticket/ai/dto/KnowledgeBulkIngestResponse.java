package com.movieticket.ai.dto;

import java.util.List;

public record KnowledgeBulkIngestResponse(
        int indexedCount,
        List<KnowledgeResponse> documents
) {
}
