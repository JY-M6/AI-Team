package com.qianji.ledger;

import com.qianji.common.exception.BusinessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
public class AccountService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Shanghai");

    private final LedgerRepository ledgerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final DatabaseClient databaseClient;
    private final TransactionalOperator transactionalOperator;

    public AccountService(
            LedgerRepository ledgerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            DatabaseClient databaseClient,
            TransactionalOperator transactionalOperator
    ) {
        this.ledgerRepository = ledgerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.databaseClient = databaseClient;
        this.transactionalOperator = transactionalOperator;
    }

    public Mono<AccountResponse> create(Long userId, CreateAccountRequest request) {
        String name = request.name().trim();
        return ledgerRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(request.ledgerId(), userId, "ACTIVE")
                .switchIfEmpty(notFound("账本不存在"))
                .then(accountRepository.existsByUserIdAndLedgerIdAndNameAndDeletedAtIsNull(
                        userId, request.ledgerId(), name))
                .flatMap(exists -> exists
                        ? conflict("ACCOUNT_NAME_EXISTS", "同一账本中已存在同名账户")
                        : saveAccount(userId, request, name));
    }

    public Mono<AccountResponse> update(Long userId, Long accountId, UpdateAccountRequest request) {
        Mono<AccountResponse> operation = accountRepository
                .findByIdAndUserIdAndDeletedAtIsNull(accountId, userId)
                .switchIfEmpty(notFound("账户不存在"))
                .flatMap(current -> {
                    validateVersion(current, request.version());
                    String name = request.name().trim();
                    Mono<Boolean> duplicate = current.name().equals(name)
                            ? Mono.just(false)
                            : accountRepository.existsByUserIdAndLedgerIdAndNameAndDeletedAtIsNull(
                                    userId, current.ledgerId(), name);
                    return duplicate.flatMap(exists -> exists
                            ? conflict("ACCOUNT_NAME_EXISTS", "同一账本中已存在同名账户")
                            : updateAccount(userId, current, request, name));
                });
        return transactionalOperator.transactional(operation);
    }

    public Mono<Void> delete(Long userId, Long accountId, long version) {
        if (version < 0) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "version不能小于0"));
        }
        Mono<Void> operation = accountRepository
                .findByIdAndUserIdAndDeletedAtIsNull(accountId, userId)
                .switchIfEmpty(notFound("账户不存在"))
                .flatMap(current -> {
                    validateVersion(current, version);
                    if (current.balance().signum() != 0) {
                        return Mono.error(new BusinessException(
                                HttpStatus.CONFLICT,
                                "ACCOUNT_BALANCE_NOT_ZERO",
                                "账户余额不为0，请先校准余额"
                        ));
                    }
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    return databaseClient.sql("""
                                    UPDATE accounts
                                    SET status = 'DISABLED', deleted_at = :now,
                                        updated_at = :now, version = version + 1
                                    WHERE id = :accountId AND user_id = :userId
                                      AND version = :version AND deleted_at IS NULL
                                    """)
                            .bind("now", now)
                            .bind("accountId", accountId)
                            .bind("userId", userId)
                            .bind("version", version)
                            .fetch()
                            .rowsUpdated()
                            .flatMap(updated -> updated == 1 ? Mono.empty() : versionConflict());
                });
        return transactionalOperator.transactional(operation);
    }

    public Mono<AccountResponse> adjustBalance(
            Long userId,
            Long accountId,
            BalanceAdjustmentRequest request
    ) {
        String requestId = request.requestId().trim();
        return transactionRepository.findByUserIdAndRequestIdAndDeletedAtIsNull(userId, requestId)
                .flatMap(existing -> existing.type().equals("ADJUSTMENT")
                                && existing.accountId().equals(accountId)
                        ? accountRepository.findByIdAndUserIdAndDeletedAtIsNull(accountId, userId)
                                .map(AccountResponse::from)
                        : conflict("REQUEST_ID_REUSED", "该请求标识已被其他账单使用"))
                .switchIfEmpty(transactionalOperator.transactional(
                        adjustNewBalance(userId, accountId, request, requestId)))
                .onErrorResume(DataIntegrityViolationException.class, exception ->
                        transactionRepository.findByUserIdAndRequestIdAndDeletedAtIsNull(userId, requestId)
                                .filter(existing -> existing.type().equals("ADJUSTMENT")
                                        && existing.accountId().equals(accountId))
                                .flatMap(existing -> accountRepository
                                        .findByIdAndUserIdAndDeletedAtIsNull(accountId, userId)
                                        .map(AccountResponse::from))
                                .switchIfEmpty(Mono.error(exception)));
    }

    private Mono<AccountResponse> saveAccount(
            Long userId,
            CreateAccountRequest request,
            String name
    ) {
        LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
        AccountEntity account = new AccountEntity(
                null,
                userId,
                request.ledgerId(),
                name,
                request.type(),
                BigDecimal.ZERO,
                request.currency() == null ? "CNY" : request.currency(),
                "ACTIVE",
                0,
                now,
                now,
                now,
                null
        );
        return accountRepository.save(account).map(AccountResponse::from);
    }

    private Mono<AccountResponse> updateAccount(
            Long userId,
            AccountEntity current,
            UpdateAccountRequest request,
            String name
    ) {
        LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
        return databaseClient.sql("""
                        UPDATE accounts
                        SET name = :name, type = :type,
                            version = version + 1, updated_at = :now
                        WHERE id = :accountId AND user_id = :userId
                          AND version = :version AND deleted_at IS NULL
                        """)
                .bind("name", name)
                .bind("type", request.type())
                .bind("now", now)
                .bind("accountId", current.id())
                .bind("userId", userId)
                .bind("version", current.version())
                .fetch()
                .rowsUpdated()
                .flatMap(updated -> updated == 1
                        ? Mono.just(new AccountResponse(
                                current.id().toString(),
                                current.ledgerId().toString(),
                                name,
                                request.type(),
                                current.balance(),
                                current.currency(),
                                current.status(),
                                current.version() + 1,
                                current.balanceUpdatedAt()))
                        : versionConflict());
    }

    private Mono<AccountResponse> adjustNewBalance(
            Long userId,
            Long accountId,
            BalanceAdjustmentRequest request,
            String requestId
    ) {
        return accountRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(accountId, userId, "ACTIVE")
                .switchIfEmpty(notFound("账户不存在"))
                .flatMap(current -> {
                    validateVersion(current, request.version());
                    BigDecimal target = request.targetBalance();
                    BigDecimal delta = target.subtract(current.balance());
                    if (delta.signum() == 0) {
                        return Mono.error(new BusinessException(
                                HttpStatus.CONFLICT,
                                "BALANCE_UNCHANGED",
                                "目标余额与当前余额相同，无需校准"
                        ));
                    }
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    return setBalance(userId, current, target, now)
                            .then(transactionRepository.save(new TransactionEntity(
                                    null,
                                    userId,
                                    current.ledgerId(),
                                    current.id(),
                                    null,
                                    null,
                                    requestId,
                                    "ADJUSTMENT",
                                    delta.abs(),
                                    delta,
                                    localDateTime(request.occurredAt()),
                                    normalizeNote(request.note()),
                                    "SYSTEM",
                                    "CONFIRMED",
                                    true,
                                    0,
                                    now,
                                    now,
                                    null
                            )))
                            .thenReturn(new AccountResponse(
                                    current.id().toString(),
                                    current.ledgerId().toString(),
                                    current.name(),
                                    current.type(),
                                    target,
                                    current.currency(),
                                    current.status(),
                                    current.version() + 1,
                                    now
                            ));
                });
    }

    private Mono<Void> setBalance(
            Long userId,
            AccountEntity account,
            BigDecimal target,
            LocalDateTime now
    ) {
        return databaseClient.sql("""
                        UPDATE accounts
                        SET balance = :target, version = version + 1,
                            balance_updated_at = :now, updated_at = :now
                        WHERE id = :accountId AND user_id = :userId
                          AND version = :version AND status = 'ACTIVE'
                          AND deleted_at IS NULL
                        """)
                .bind("target", target)
                .bind("now", now)
                .bind("accountId", account.id())
                .bind("userId", userId)
                .bind("version", account.version())
                .fetch()
                .rowsUpdated()
                .flatMap(updated -> updated == 1 ? Mono.empty() : versionConflict());
    }

    private void validateVersion(AccountEntity account, long expectedVersion) {
        if (account.version() != expectedVersion) {
            throw new BusinessException(
                    HttpStatus.CONFLICT, "VERSION_CONFLICT", "账户已被其他操作修改，请刷新后重试");
        }
    }

    private String normalizeNote(String note) {
        return note == null || note.isBlank() ? null : note.trim();
    }

    private LocalDateTime localDateTime(OffsetDateTime value) {
        return value.atZoneSameInstant(BUSINESS_ZONE).toLocalDateTime();
    }

    private <T> Mono<T> notFound(String message) {
        return Mono.error(new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", message));
    }

    private <T> Mono<T> conflict(String code, String message) {
        return Mono.error(new BusinessException(HttpStatus.CONFLICT, code, message));
    }

    private <T> Mono<T> versionConflict() {
        return conflict("VERSION_CONFLICT", "数据已变化，请刷新后重试");
    }
}
