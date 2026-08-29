package com.qianji.ledger;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface LedgerRepository extends ReactiveCrudRepository<LedgerEntity, Long> {

    Flux<LedgerEntity> findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtAsc(Long userId);

    Mono<LedgerEntity> findByIdAndUserIdAndStatusAndDeletedAtIsNull(Long id, Long userId, String status);
}
