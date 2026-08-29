package com.qianji.ledger;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AccountRepository extends ReactiveCrudRepository<AccountEntity, Long> {

    Flux<AccountEntity> findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtAsc(Long userId);

    Mono<AccountEntity> findByIdAndUserIdAndStatusAndDeletedAtIsNull(Long id, Long userId, String status);

    Mono<AccountEntity> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);

    Mono<Boolean> existsByUserIdAndLedgerIdAndNameAndDeletedAtIsNull(Long userId, Long ledgerId, String name);
}
