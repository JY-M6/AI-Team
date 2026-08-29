package com.qianji.ledger;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("transactions")
public record TransactionEntity(
        @Id Long id,
        Long userId,
        Long ledgerId,
        Long accountId,
        Long targetAccountId,
        Long categoryId,
        String requestId,
        String type,
        BigDecimal amount,
        BigDecimal balanceDelta,
        LocalDateTime occurredAt,
        String note,
        String source,
        String status,
        boolean isSystem,
        long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {
}
