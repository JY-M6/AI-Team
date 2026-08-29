package com.qianji.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "用户名不能为空") String username,
        @NotBlank(message = "密码不能为空") String password,
        @Size(max = 128, message = "设备标识不能超过 128 个字符") String deviceId,
        @Size(max = 128, message = "设备名称不能超过 128 个字符") String deviceName
) {
}
