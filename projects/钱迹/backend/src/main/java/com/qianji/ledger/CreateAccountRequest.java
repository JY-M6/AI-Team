package com.qianji.ledger;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateAccountRequest(
        @NotNull(message = "不能为空")
        Long ledgerId,

        @NotBlank(message = "不能为空")
        @Size(max = 64, message = "长度不能超过64个字符")
        String name,

        @NotBlank(message = "不能为空")
        @Pattern(
                regexp = "CASH|WECHAT|ALIPAY|BANK_CARD|CREDIT_CARD|CHANGE|OTHER",
                message = "账户类型不支持"
        )
        String type,

        @Pattern(regexp = "[A-Z]{3}", message = "必须是3位大写货币代码")
        String currency
) {
}
