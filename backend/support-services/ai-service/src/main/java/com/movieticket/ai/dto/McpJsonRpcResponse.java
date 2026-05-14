package com.movieticket.ai.dto;

public record McpJsonRpcResponse(
        String jsonrpc,
        Object id,
        Object result,
        McpError error
) {
    public static McpJsonRpcResponse result(Object id, Object result) {
        return new McpJsonRpcResponse("2.0", id, result, null);
    }

    public static McpJsonRpcResponse error(Object id, int code, String message) {
        return new McpJsonRpcResponse("2.0", id, null, new McpError(code, message));
    }
}
