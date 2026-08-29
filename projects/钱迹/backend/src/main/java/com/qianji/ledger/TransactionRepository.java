package com.qianji.ledger;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface TransactionRepository extends ReactiveCrudRepository<TransactionEntity, Long> {

    Mono<TransactionEntity> findByUserIdAndRequestIdAndDeletedAtIsNull(Long userId, String requestId);

    Mono<TransactionEntity> findByUserIdAndRequestId(Long userId, String requestId);

    Mono<TransactionEntity> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);
}
