package com.qianji.budget;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Table("budgets")
public record BudgetEntity(
        @Id Long id,
        Long userId,
        Long ledgerId,
        LocalDate budgetMonth,
        Long categoryId,
        BigDecimal amount,
        BigDecimal alertThreshold,
        boolean enabled,
        long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
