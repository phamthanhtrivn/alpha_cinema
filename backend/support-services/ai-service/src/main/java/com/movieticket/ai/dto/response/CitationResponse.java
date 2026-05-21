package com.movieticket.ai.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CitationResponse {
    private String source;
    private String topic;
    private Integer chunkIndex;
    private String preview;
}
