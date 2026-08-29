package com.qianji.ledger;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record CreateTransactionRequest(
        @NotBlank(message = "不能为空")
        @Size(max = 64, message = "长度不能超过64个字符")
        String requestId,

        @NotNull(message = "不能为空")
        Long ledgerId,

        @NotBlank(message = "不能为空")
        @Pattern(regexp = "EXPENSE|INCOME|TRANSFER", message = "当前只支持EXPENSE、INCOME或TRANSFER")
        String type,

        @NotNull(message = "不能为空")
        Long accountId,

        Long targetAccountId,

        Long categoryId,

        @NotNull(message = "不能为空")
        @DecimalMin(value = "0.01", message = "必须大于0")
        @Digits(integer = 17, fraction = 2, message = "最多保留两位小数")
        BigDecimal amount,

        @NotNull(message = "不能为空")
        OffsetDateTime occurredAt,

        @Size(max = 500, message = "长度不能超过500个字符")
        String note,

        List<Long> tagIds
) {
}
