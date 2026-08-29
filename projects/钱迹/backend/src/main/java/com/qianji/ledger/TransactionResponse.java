package com.qianji.ledger;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TransactionResponse(
        String id,
        String requestId,
        String ledgerId,
        String type,
        String accountId,
        String accountName,
        String targetAccountId,
        String targetAccountName,
        String categoryId,
        String categoryName,
        BigDecimal amount,
        BigDecimal balanceDelta,
        OffsetDateTime occurredAt,
        String note,
        String source,
        String status,
        long version
) {
}
