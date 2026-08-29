package com.qianji.budget;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull(message = "不能为空")
        Long ledgerId,

        @NotBlank(message = "不能为空")
        String month,

        @NotNull(message = "不能为空")
        @DecimalMin(value = "0.01", message = "必须大于0")
        @Digits(integer = 17, fraction = 2, message = "最多保留两位小数")
        BigDecimal amount,

        @NotNull(message = "不能为空")
        @DecimalMin(value = "0.01", message = "必须大于0")
        @DecimalMax(value = "100.00", message = "不能大于100")
        BigDecimal alertThreshold,

        @NotNull(message = "不能为空")
        Boolean enabled,

        @PositiveOrZero(message = "不能小于0")
        Long version
) {
}
