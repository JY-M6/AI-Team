package com.qianji.ledger;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
        @NotBlank(message = "不能为空")
        @Pattern(regexp = "EXPENSE|INCOME", message = "当前只支持EXPENSE或INCOME")
        String type,

        @NotBlank(message = "不能为空")
        @Size(max = 64, message = "长度不能超过64个字符")
        String name,

        @Size(max = 64, message = "长度不能超过64个字符")
        String icon,

        @Pattern(regexp = "#[0-9A-Fa-f]{6}", message = "必须是六位十六进制颜色")
        String color,

        Integer sortOrder
) {
}
