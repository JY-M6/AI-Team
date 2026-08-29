package com.qianji.common.api;

import java.time.Instant;

public record ApiResponse<T>(String code, String message, T data, Instant timestamp) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("OK", "成功", data, Instant.now());
    }
}
