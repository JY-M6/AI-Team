package com.qianji.ledger;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("accounts")
public record AccountEntity(
        @Id Long id,
        Long userId,
        Long ledgerId,
        String name,
        String type,
        BigDecimal balance,
        String currency,
        String status,
        long version,
        LocalDateTime balanceUpdatedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {

    public static AccountEntity empty(Long userId, Long ledgerId, String name, String type, LocalDateTime now) {
        return new AccountEntity(
                null, userId, ledgerId, name, type, BigDecimal.ZERO, "CNY", "ACTIVE", 0, now, now, now, null);
    }
}
