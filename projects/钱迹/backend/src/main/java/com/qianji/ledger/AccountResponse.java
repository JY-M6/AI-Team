package com.qianji.ledger;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 当前用户可见的资金账户余额快照。 */
public record AccountResponse(
        String id,
        String ledgerId,
        String name,
        String type,
        BigDecimal balance,
        String currency,
        String status,
        long version,
        LocalDateTime balanceUpdatedAt
) {
    static AccountResponse from(AccountEntity account) {
        return new AccountResponse(
                account.id().toString(),
                account.ledgerId().toString(),
                account.name(),
                account.type(),
                account.balance(),
                account.currency(),
                account.status(),
                account.version(),
                account.balanceUpdatedAt()
        );
    }
}
