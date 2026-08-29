package com.qianji.ledger;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateAccountRequest(
        @NotBlank(message = "不能为空")
        @Size(max = 64, message = "长度不能超过64个字符")
        String name,

        @NotBlank(message = "不能为空")
        @Pattern(
                regexp = "CASH|WECHAT|ALIPAY|BANK_CARD|CREDIT_CARD|CHANGE|OTHER",
                message = "账户类型不支持"
        )
        String type,

        @NotNull(message = "不能为空")
        @PositiveOrZero(message = "不能小于0")
        Long version
) {
}
