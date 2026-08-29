package com.qianji.budget;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

public interface BudgetRepository extends ReactiveCrudRepository<BudgetEntity, Long> {

    Flux<BudgetEntity> findAllByUserIdAndLedgerIdAndBudgetMonthOrderByCategoryIdAsc(
            Long userId, Long ledgerId, LocalDate budgetMonth);

    Mono<BudgetEntity> findByUserIdAndLedgerIdAndBudgetMonthAndCategoryId(
            Long userId, Long ledgerId, LocalDate budgetMonth, Long categoryId);

    Mono<BudgetEntity> findByIdAndUserId(Long id, Long userId);
}
