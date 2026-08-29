package com.qianji.ledger;

/** 当前用户可见的账本摘要。 */
public record LedgerResponse(
        String id,
        String name,
        String type,
        String currency,
        boolean isDefault,
        String status
) {
    static LedgerResponse from(LedgerEntity ledger) {
        return new LedgerResponse(
                ledger.id().toString(),
                ledger.name(),
                ledger.type(),
                ledger.currency(),
                ledger.isDefault(),
                ledger.status()
        );
    }
}
