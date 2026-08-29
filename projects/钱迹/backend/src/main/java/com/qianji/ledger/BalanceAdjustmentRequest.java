package com.qianji.ledger;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BalanceAdjustmentRequest(
        @NotBlank(message = "不能为空")
        @Size(max = 64, message = "长度不能超过64个字符")
        String requestId,

        @NotNull(message = "不能为空")
        @DecimalMin(value = "0.00", message = "不能小于0")
        @Digits(integer = 17, fraction = 2, message = "最多保留两位小数")
        BigDecimal targetBalance,

        @NotNull(message = "不能为空")
        OffsetDateTime occurredAt,

        @Size(max = 500, message = "长度不能超过500个字符")
        String note,

        @NotNull(message = "不能为空")
        @PositiveOrZero(message = "不能小于0")
        Long version
) {
}
