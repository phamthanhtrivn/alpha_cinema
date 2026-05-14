package com.movieticket.ai.dto;

import java.util.Map;

public record McpJsonRpcRequest(
        String jsonrpc,
        Object id,
        String method,
        Map<String, Object> params
) {
}
