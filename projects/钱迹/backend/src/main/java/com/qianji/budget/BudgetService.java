package com.qianji.budget;

import com.qianji.common.exception.BusinessException;
import com.qianji.ledger.CategoryEntity;
import com.qianji.ledger.CategoryRepository;
import com.qianji.ledger.LedgerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;

@Service
public class BudgetService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Shanghai");

    private final BudgetRepository budgetRepository;
    private final LedgerRepository ledgerRepository;
    private final CategoryRepository categoryRepository;
    private final DatabaseClient databaseClient;
    private final TransactionalOperator transactionalOperator;

    public BudgetService(
            BudgetRepository budgetRepository,
            LedgerRepository ledgerRepository,
            CategoryRepository categoryRepository,
            DatabaseClient databaseClient,
            TransactionalOperator transactionalOperator
    ) {
        this.budgetRepository = budgetRepository;
        this.ledgerRepository = ledgerRepository;
        this.categoryRepository = categoryRepository;
        this.databaseClient = databaseClient;
        this.transactionalOperator = transactionalOperator;
    }

    public Flux<BudgetResponse> findAll(Long userId, Long ledgerId, String month) {
        LocalDate budgetMonth = parseMonth(month);
        return ensureLedger(userId, ledgerId)
                .thenMany(budgetRepository
                        .findAllByUserIdAndLedgerIdAndBudgetMonthOrderByCategoryIdAsc(
                                userId, ledgerId, budgetMonth))
                .concatMap(budget -> toResponse(userId, budget));
    }

    public Mono<BudgetResponse> save(Long userId, Long categoryId, BudgetRequest request) {
        LocalDate budgetMonth = parseMonth(request.month());
        Mono<Void> categoryCheck = categoryId == null
                ? Mono.empty()
                : categoryRepository.findByIdAndStatusAndDeletedAtIsNull(categoryId, "ACTIVE")
                        .filter(category -> category.userId() == null || category.userId().equals(userId))
                        .filter(category -> "EXPENSE".equals(category.type()))
                        .switchIfEmpty(notFound("支出分类不存在"))
                        .then();
        Mono<BudgetResponse> operation = ensureLedger(userId, request.ledgerId())
                .then(categoryCheck)
                .then(findScoped(userId, request.ledgerId(), budgetMonth, categoryId)
                        .flatMap(existing -> update(userId, existing, request))
                        .switchIfEmpty(Mono.defer(() -> create(
                                userId, request.ledgerId(), budgetMonth, categoryId, request))));
        return transactionalOperator.transactional(operation);
    }

    public Mono<Void> delete(Long userId, Long budgetId, long version) {
        if (version < 0) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "version不能小于0"));
        }
        return budgetRepository.findByIdAndUserId(budgetId, userId)
                .switchIfEmpty(notFound("预算不存在"))
                .flatMap(budget -> {
                    if (budget.version() != version) {
                        return versionConflict();
                    }
                    return databaseClient.sql("""
                                    DELETE FROM budgets
                                    WHERE id = :id AND user_id = :userId AND version = :version
                                    """)
                            .bind("id", budgetId)
                            .bind("userId", userId)
                            .bind("version", version)
                            .fetch().rowsUpdated()
                            .flatMap(updated -> updated == 1 ? Mono.empty() : versionConflict());
                });
    }

    private Mono<BudgetEntity> findScoped(
            Long userId,
            Long ledgerId,
            LocalDate month,
            Long categoryId
    ) {
        if (categoryId != null) {
            return budgetRepository.findByUserIdAndLedgerIdAndBudgetMonthAndCategoryId(
                    userId, ledgerId, month, categoryId);
        }
        return databaseClient.sql("""
                        SELECT * FROM budgets
                        WHERE user_id = :userId AND ledger_id = :ledgerId
                          AND budget_month = :month AND category_id IS NULL
                        """)
                .bind("userId", userId)
                .bind("ledgerId", ledgerId)
                .bind("month", month)
                .mapProperties(BudgetEntity.class)
                .one();
    }

    private Mono<BudgetResponse> create(
            Long userId,
            Long ledgerId,
            LocalDate month,
            Long categoryId,
            BudgetRequest request
    ) {
        if (request.version() != null) {
            return Mono.error(new BusinessException(
                    HttpStatus.CONFLICT, "VERSION_CONFLICT", "新建预算时不能携带version"));
        }
        LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
        BudgetEntity budget = new BudgetEntity(
                null, userId, ledgerId, month, categoryId, request.amount(),
                request.alertThreshold(), request.enabled(), 0, now, now);
        return budgetRepository.save(budget).flatMap(saved -> toResponse(userId, saved));
    }

    private Mono<BudgetResponse> update(Long userId, BudgetEntity budget, BudgetRequest request) {
        if (request.version() == null || budget.version() != request.version()) {
            return versionConflict();
        }
        return databaseClient.sql("""
                        UPDATE budgets
                        SET amount = :amount, alert_threshold = :threshold,
                            enabled = :enabled, version = version + 1, updated_at = :now
                        WHERE id = :id AND user_id = :userId AND version = :version
                        """)
                .bind("amount", request.amount())
                .bind("threshold", request.alertThreshold())
                .bind("enabled", request.enabled())
                .bind("now", LocalDateTime.now(BUSINESS_ZONE))
                .bind("id", budget.id())
                .bind("userId", userId)
                .bind("version", budget.version())
                .fetch().rowsUpdated()
                .flatMap(updated -> updated == 1
                        ? toResponse(userId, new BudgetEntity(
                                budget.id(), budget.userId(), budget.ledgerId(), budget.budgetMonth(),
                                budget.categoryId(), request.amount(), request.alertThreshold(),
                                request.enabled(), budget.version() + 1,
                                budget.createdAt(), LocalDateTime.now(BUSINESS_ZONE)))
                        : versionConflict());
    }

    private Mono<BudgetResponse> toResponse(Long userId, BudgetEntity budget) {
        Mono<BigDecimal> used = usedAmount(userId, budget);
        Mono<String> categoryName = budget.categoryId() == null
                ? Mono.just("总预算")
                : categoryRepository.findById(budget.categoryId())
                        .map(CategoryEntity::name)
                        .defaultIfEmpty("已停用分类");
        return Mono.zip(used, categoryName)
                .map(tuple -> {
                    BigDecimal usedAmount = tuple.getT1();
                    BigDecimal remaining = budget.amount().subtract(usedAmount);
                    BigDecimal percentage = usedAmount.multiply(BigDecimal.valueOf(100))
                            .divide(budget.amount(), 2, RoundingMode.HALF_UP);
                    return new BudgetResponse(
                            budget.id().toString(),
                            budget.ledgerId().toString(),
                            YearMonth.from(budget.budgetMonth()).toString(),
                            budget.categoryId() == null ? null : budget.categoryId().toString(),
                            tuple.getT2(),
                            budget.amount(),
                            usedAmount,
                            remaining,
                            percentage,
                            budget.alertThreshold(),
                            budget.enabled(),
                            budget.enabled() && percentage.compareTo(budget.alertThreshold()) >= 0,
                            usedAmount.compareTo(budget.amount()) > 0,
                            budget.version()
                    );
                });
    }

    private Mono<BigDecimal> usedAmount(Long userId, BudgetEntity budget) {
        LocalDateTime start = budget.budgetMonth().atStartOfDay();
        LocalDateTime end = budget.budgetMonth().plusMonths(1).atStartOfDay();
        DatabaseClient.GenericExecuteSpec spec = databaseClient.sql("""
                        SELECT COALESCE(SUM(amount), 0) AS used_amount
                        FROM transactions
                        WHERE user_id = :userId AND ledger_id = :ledgerId
                          AND type = 'EXPENSE' AND status = 'CONFIRMED'
                          AND deleted_at IS NULL
                          AND occurred_at >= :startAt AND occurred_at < :endAt
                          AND (:categoryId IS NULL OR category_id = :categoryId)
                        """)
                .bind("userId", userId)
                .bind("ledgerId", budget.ledgerId())
                .bind("startAt", start)
                .bind("endAt", end);
        spec = budget.categoryId() == null
                ? spec.bindNull("categoryId", Long.class)
                : spec.bind("categoryId", budget.categoryId());
        return spec.map((row, metadata) -> row.get("used_amount", BigDecimal.class)).one()
                .defaultIfEmpty(BigDecimal.ZERO);
    }

    private Mono<Void> ensureLedger(Long userId, Long ledgerId) {
        return ledgerRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(ledgerId, userId, "ACTIVE")
                .switchIfEmpty(notFound("账本不存在"))
                .then();
    }

    private LocalDate parseMonth(String month) {
        try {
            return YearMonth.parse(month).atDay(1);
        } catch (RuntimeException exception) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "month格式必须为yyyy-MM");
        }
    }

    private <T> Mono<T> notFound(String message) {
        return Mono.error(new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", message));
    }

    private <T> Mono<T> versionConflict() {
        return Mono.error(new BusinessException(
                HttpStatus.CONFLICT, "VERSION_CONFLICT", "预算已变化，请刷新后重试"));
    }
}
