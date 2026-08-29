package com.qianji.common.api;

import java.time.Instant;

public record ApiErrorResponse(String code, String message, String path, Instant timestamp) {

    public static ApiErrorResponse of(String code, String message, String path) {
        return new ApiErrorResponse(code, message, path, Instant.now());
    }
}
