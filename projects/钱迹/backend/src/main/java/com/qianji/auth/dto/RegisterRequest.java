package com.qianji.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "用户名不能为空")
        @Pattern(regexp = "^[A-Za-z0-9_]{4,32}$", message = "用户名只能包含字母、数字和下划线，长度为 4 到 32 位")
        String username,
        @NotBlank(message = "密码不能为空")
        @Size(min = 8, max = 72, message = "密码长度必须为 8 到 72 个字符")
        String password,
        @NotBlank(message = "昵称不能为空")
        @Size(max = 64, message = "昵称不能超过 64 个字符")
        String nickname,
        @Size(max = 128, message = "设备标识不能超过 128 个字符")
        String deviceId,
        @Size(max = 128, message = "设备名称不能超过 128 个字符")
        String deviceName
) {
}
