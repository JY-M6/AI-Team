ALTER TABLE transactions
    ADD COLUMN balance_delta DECIMAL(19, 2) NULL AFTER amount;

ALTER TABLE transactions
    ADD CONSTRAINT chk_transactions_adjustment_delta CHECK (
        (type = 'ADJUSTMENT' AND balance_delta IS NOT NULL AND balance_delta <> 0)
        OR (type <> 'ADJUSTMENT' AND balance_delta IS NULL)
    );
