package com.qianji.budget;

import java.math.BigDecimal;

public record BudgetResponse(
        String id,
        String ledgerId,
        String month,
        String categoryId,
        String categoryName,
        BigDecimal amount,
        BigDecimal used,
        BigDecimal remaining,
        BigDecimal usagePercentage,
        BigDecimal alertThreshold,
        boolean enabled,
        boolean alertReached,
        boolean exceeded,
        long version
) {
}
