package com.movieticket.ai.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatClearResponse {
    private String conversationId;
    private int archivedMessageCount;
}
