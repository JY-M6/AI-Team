package com.qianji.ledger;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CategoryRepository extends ReactiveCrudRepository<CategoryEntity, Long> {

    Mono<CategoryEntity> findByIdAndStatusAndDeletedAtIsNull(Long id, String status);

    Mono<CategoryEntity> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);

    Flux<CategoryEntity> findAllByUserIdAndTypeAndDeletedAtIsNullOrderBySortOrderAsc(
            Long userId, String type);

    Mono<Boolean> existsByUserIdAndTypeAndNameAndDeletedAtIsNull(Long userId, String type, String name);
}
