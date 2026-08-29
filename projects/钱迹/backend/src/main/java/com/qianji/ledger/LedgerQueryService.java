package com.qianji.ledger;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class LedgerQueryService {

    private final LedgerRepository ledgerRepository;
    private final AccountRepository accountRepository;

    public LedgerQueryService(LedgerRepository ledgerRepository, AccountRepository accountRepository) {
        this.ledgerRepository = ledgerRepository;
        this.accountRepository = accountRepository;
    }

    public Mono<List<LedgerResponse>> findLedgers(Long userId) {
        return ledgerRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtAsc(userId)
                .map(LedgerResponse::from)
                .collectList();
    }

    public Mono<List<AccountResponse>> findAccounts(Long userId) {
        return accountRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtAsc(userId)
                .map(AccountResponse::from)
                .collectList();
    }
}
