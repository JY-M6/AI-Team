package com.qianji.ledger;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("ledgers")
public record LedgerEntity(
        @Id Long id,
        Long userId,
        String name,
        String type,
        String currency,
        boolean isDefault,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {

    public static LedgerEntity defaultLedger(Long userId, LocalDateTime now) {
        return new LedgerEntity(null, userId, "默认账本", "PERSONAL", "CNY", true, "ACTIVE", now, now, null);
    }
}
