package com.qianji.ledger;

import com.qianji.common.exception.BusinessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class TransactionService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Shanghai");
    private static final Set<String> QUERY_TYPES = Set.of("EXPENSE", "INCOME", "TRANSFER");
    private static final Set<String> EDITABLE_TYPES = Set.of("EXPENSE", "INCOME", "TRANSFER");

    private final LedgerRepository ledgerRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final DatabaseClient databaseClient;
    private final TransactionalOperator transactionalOperator;

    public TransactionService(
            LedgerRepository ledgerRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            DatabaseClient databaseClient,
            TransactionalOperator transactionalOperator
    ) {
        this.ledgerRepository = ledgerRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.databaseClient = databaseClient;
        this.transactionalOperator = transactionalOperator;
    }

    public Mono<TransactionResponse> create(Long userId, CreateTransactionRequest request) {
        String requestId = request.requestId().trim();
        return transactionRepository.findByUserIdAndRequestIdAndDeletedAtIsNull(userId, requestId)
                .flatMap(this::toResponse)
                .switchIfEmpty(transactionalOperator.transactional(createNew(userId, request, requestId)))
                .onErrorResume(DataIntegrityViolationException.class, exception ->
                        transactionRepository.findByUserIdAndRequestId(userId, requestId)
                                .flatMap(transaction -> transaction.deletedAt() == null
                                        ? toResponse(transaction)
                                        : Mono.error(new BusinessException(
                                                HttpStatus.CONFLICT,
                                                "REQUEST_ID_REUSED",
                                                "该请求标识已用于删除的账单，不能重复使用")))
                                .switchIfEmpty(Mono.error(exception)));
    }

    public Mono<TransactionResponse> findOne(Long userId, Long transactionId) {
        return transactionRepository.findByIdAndUserIdAndDeletedAtIsNull(transactionId, userId)
                .switchIfEmpty(notFound("账单不存在"))
                .flatMap(this::toResponse);
    }

    public Mono<TransactionResponse> update(
            Long userId,
            Long transactionId,
            UpdateTransactionRequest request
    ) {
        Mono<TransactionResponse> operation = transactionRepository
                .findByIdAndUserIdAndDeletedAtIsNull(transactionId, userId)
                .switchIfEmpty(notFound("账单不存在"))
                .flatMap(current -> updateExisting(userId, current, request));
        return transactionalOperator.transactional(operation);
    }

    public Mono<Void> delete(Long userId, Long transactionId, long version) {
        if (version < 0) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "version不能小于0"));
        }
        Mono<Void> operation = transactionRepository
                .findByIdAndUserIdAndDeletedAtIsNull(transactionId, userId)
                .switchIfEmpty(notFound("账单不存在"))
                .flatMap(current -> deleteExisting(userId, current, version));
        return transactionalOperator.transactional(operation);
    }

    public Flux<TransactionResponse> findAll(
            Long userId,
            Long ledgerId,
            OffsetDateTime startAt,
            OffsetDateTime endAt,
            String type,
            Long categoryId,
            Long accountId,
            int limit
    ) {
        if (limit < 1 || limit > 100) {
            return Flux.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "limit必须在1到100之间"));
        }
        if (type != null && !QUERY_TYPES.contains(type)) {
            return Flux.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "当前只支持EXPENSE、INCOME或TRANSFER"));
        }
        if (startAt != null && endAt != null && !startAt.isBefore(endAt)) {
            return Flux.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "startAt必须早于endAt"));
        }

        DatabaseClient.GenericExecuteSpec spec = databaseClient.sql("""
                SELECT t.id AS transaction_id, t.request_id, t.ledger_id, t.type,
                       t.account_id, a.name AS account_name,
                       t.target_account_id, ta.name AS target_account_name,
                       t.category_id, c.name AS category_name,
                       t.amount, t.balance_delta, t.occurred_at, t.note, t.source, t.status, t.version
                FROM transactions t
                JOIN accounts a ON a.id = t.account_id
                LEFT JOIN accounts ta ON ta.id = t.target_account_id
                LEFT JOIN categories c ON c.id = t.category_id
                WHERE t.user_id = :userId
                  AND t.deleted_at IS NULL
                  AND (:ledgerId IS NULL OR t.ledger_id = :ledgerId)
                  AND (:startAt IS NULL OR t.occurred_at >= :startAt)
                  AND (:endAt IS NULL OR t.occurred_at < :endAt)
                  AND (:type IS NULL OR t.type = :type)
                  AND (:categoryId IS NULL OR t.category_id = :categoryId)
                  AND (:accountId IS NULL OR t.account_id = :accountId OR t.target_account_id = :accountId)
                ORDER BY t.occurred_at DESC, t.id DESC
                LIMIT :limit
                """)
                .bind("userId", userId)
                .bind("limit", limit);
        spec = bindNullable(spec, "ledgerId", ledgerId, Long.class);
        spec = bindNullable(spec, "startAt", localDateTime(startAt), LocalDateTime.class);
        spec = bindNullable(spec, "endAt", localDateTime(endAt), LocalDateTime.class);
        spec = bindNullable(spec, "type", type, String.class);
        spec = bindNullable(spec, "categoryId", categoryId, Long.class);
        spec = bindNullable(spec, "accountId", accountId, Long.class);

        return spec.map((row, metadata) -> new TransactionResponse(
                stringId(row.get("transaction_id", Number.class)),
                row.get("request_id", String.class),
                stringId(row.get("ledger_id", Number.class)),
                row.get("type", String.class),
                stringId(row.get("account_id", Number.class)),
                row.get("account_name", String.class),
                stringId(row.get("target_account_id", Number.class)),
                row.get("target_account_name", String.class),
                stringId(row.get("category_id", Number.class)),
                row.get("category_name", String.class),
                row.get("amount", BigDecimal.class),
                row.get("balance_delta", BigDecimal.class),
                offsetDateTime(row.get("occurred_at", LocalDateTime.class)),
                row.get("note", String.class),
                row.get("source", String.class),
                row.get("status", String.class),
                number(row.get("version", Number.class))
        )).all();
    }

    private Mono<TransactionResponse> createNew(
            Long userId,
            CreateTransactionRequest request,
            String requestId
    ) {
        if (request.tagIds() != null && !request.tagIds().isEmpty()) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "TAGS_NOT_SUPPORTED", "账单标签将在后续迭代开放"));
        }
        if ("TRANSFER".equals(request.type())) {
            return createTransfer(userId, request, requestId);
        }
        return createIncomeOrExpense(userId, request, requestId);
    }

    private Mono<TransactionResponse> createIncomeOrExpense(
            Long userId,
            CreateTransactionRequest request,
            String requestId
    ) {
        if (request.targetAccountId() != null) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "收支账单不能设置目标账户"));
        }
        if (request.categoryId() == null) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "收支账单必须选择分类"));
        }

        Mono<LedgerEntity> ledger = ledgerRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(request.ledgerId(), userId, "ACTIVE")
                .switchIfEmpty(notFound("账本不存在"));
        Mono<AccountEntity> account = accountRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(request.accountId(), userId, "ACTIVE")
                .filter(value -> value.ledgerId().equals(request.ledgerId()))
                .switchIfEmpty(notFound("账户不存在"));
        Mono<CategoryEntity> category = categoryRepository
                .findByIdAndStatusAndDeletedAtIsNull(request.categoryId(), "ACTIVE")
                .filter(value -> value.userId() == null || value.userId().equals(userId))
                .filter(value -> value.type().equals(request.type()))
                .switchIfEmpty(notFound("分类不存在或类型不匹配"));

        return Mono.zip(ledger, account, category)
                .flatMap(tuple -> {
                    AccountEntity currentAccount = tuple.getT2();
                    CategoryEntity currentCategory = tuple.getT3();
                    if ("EXPENSE".equals(request.type())
                            && currentAccount.balance().compareTo(request.amount()) < 0) {
                        return Mono.error(new BusinessException(
                                HttpStatus.UNPROCESSABLE_ENTITY,
                                "INSUFFICIENT_BALANCE",
                                "账户余额不足"
                        ));
                    }
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    TransactionEntity transaction = new TransactionEntity(
                            null,
                            userId,
                            request.ledgerId(),
                            request.accountId(),
                            null,
                            request.categoryId(),
                            requestId,
                            request.type(),
                            request.amount(),
                            null,
                            localDateTime(request.occurredAt()),
                            normalizeNote(request.note()),
                            "MANUAL",
                            "CONFIRMED",
                            false,
                            0,
                            now,
                            now,
                            null
                    );
                    return updateBalance(userId, currentAccount, request.type(), request.amount(), now)
                            .then(transactionRepository.save(transaction))
                            .map(saved -> toResponse(
                                    saved, currentAccount.name(), null, currentCategory.name()));
                });
    }

    private Mono<TransactionResponse> createTransfer(
            Long userId,
            CreateTransactionRequest request,
            String requestId
    ) {
        if (request.targetAccountId() == null) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "转账必须选择转入账户"));
        }
        if (request.accountId().equals(request.targetAccountId())) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "转出和转入账户不能相同"));
        }
        if (request.categoryId() != null) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "转账不能设置收支分类"));
        }

        Mono<LedgerEntity> ledger = ledgerRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(request.ledgerId(), userId, "ACTIVE")
                .switchIfEmpty(notFound("账本不存在"));
        Mono<AccountEntity> sourceAccount = accountRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(request.accountId(), userId, "ACTIVE")
                .filter(value -> value.ledgerId().equals(request.ledgerId()))
                .switchIfEmpty(notFound("转出账户不存在"));
        Mono<AccountEntity> targetAccount = accountRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(
                        request.targetAccountId(), userId, "ACTIVE")
                .filter(value -> value.ledgerId().equals(request.ledgerId()))
                .switchIfEmpty(notFound("转入账户不存在"));

        return Mono.zip(ledger, sourceAccount, targetAccount)
                .flatMap(tuple -> {
                    AccountEntity source = tuple.getT2();
                    AccountEntity target = tuple.getT3();
                    if (source.balance().compareTo(request.amount()) < 0) {
                        return Mono.error(new BusinessException(
                                HttpStatus.UNPROCESSABLE_ENTITY,
                                "INSUFFICIENT_BALANCE",
                                "转出账户余额不足"
                        ));
                    }
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    TransactionEntity transaction = new TransactionEntity(
                            null,
                            userId,
                            request.ledgerId(),
                            request.accountId(),
                            request.targetAccountId(),
                            null,
                            requestId,
                            "TRANSFER",
                            request.amount(),
                            null,
                            localDateTime(request.occurredAt()),
                            normalizeNote(request.note()),
                            "MANUAL",
                            "CONFIRMED",
                            false,
                            0,
                            now,
                            now,
                            null
                    );
                    return updateTransferBalances(userId, source, target, request.amount(), now)
                            .then(transactionRepository.save(transaction))
                            .map(saved -> toResponse(saved, source.name(), target.name(), null));
                });
    }

    private Mono<Void> updateTransferBalances(
            Long userId,
            AccountEntity source,
            AccountEntity target,
            BigDecimal amount,
            LocalDateTime now
    ) {
        Mono<Void> updateSource = updateAccountBalance(userId, source, amount.negate(), now);
        Mono<Void> updateTarget = updateAccountBalance(userId, target, amount, now);
        return source.id() < target.id()
                ? updateSource.then(updateTarget)
                : updateTarget.then(updateSource);
    }

    private Mono<TransactionResponse> updateExisting(
            Long userId,
            TransactionEntity current,
            UpdateTransactionRequest request
    ) {
        validateVersion(current, request.version());
        ensureSupportedType(current.type());
        validateTypeFamily(current.type(), request.type());
        validateTags(request.tagIds());
        if ("TRANSFER".equals(current.type())) {
            return updateTransfer(userId, current, request);
        }
        validateIncomeOrExpenseRequest(request.targetAccountId(), request.categoryId());

        Mono<LedgerEntity> ledger = ledgerRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(request.ledgerId(), userId, "ACTIVE")
                .switchIfEmpty(notFound("账本不存在"));
        Mono<AccountEntity> oldAccount = accountRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(current.accountId(), userId, "ACTIVE")
                .filter(value -> value.ledgerId().equals(current.ledgerId()))
                .switchIfEmpty(notFound("原账户不存在"));
        Mono<AccountEntity> newAccount = accountRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(request.accountId(), userId, "ACTIVE")
                .filter(value -> value.ledgerId().equals(request.ledgerId()))
                .switchIfEmpty(notFound("账户不存在"));
        Mono<CategoryEntity> category = categoryRepository
                .findByIdAndStatusAndDeletedAtIsNull(request.categoryId(), "ACTIVE")
                .filter(value -> value.userId() == null || value.userId().equals(userId))
                .filter(value -> value.type().equals(request.type()))
                .switchIfEmpty(notFound("分类不存在或类型不匹配"));

        return Mono.zip(ledger, oldAccount, newAccount, category)
                .flatMap(tuple -> {
                    AccountEntity previousAccount = tuple.getT2();
                    AccountEntity nextAccount = tuple.getT3();
                    CategoryEntity nextCategory = tuple.getT4();
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    return applyUpdateBalance(
                                    userId,
                                    current,
                                    request,
                                    previousAccount,
                                    nextAccount,
                                    now
                            )
                            .then(updateTransaction(userId, current, request, now))
                            .thenReturn(new TransactionResponse(
                                    current.id().toString(),
                                    current.requestId(),
                                    request.ledgerId().toString(),
                                    request.type(),
                                    request.accountId().toString(),
                                    nextAccount.name(),
                                    null,
                                    null,
                                    request.categoryId().toString(),
                                    nextCategory.name(),
                                    request.amount(),
                                    null,
                                    offsetDateTime(localDateTime(request.occurredAt())),
                                    normalizeNote(request.note()),
                                    current.source(),
                                    current.status(),
                                    current.version() + 1
                            ));
                });
    }

    private Mono<Void> deleteExisting(
            Long userId,
            TransactionEntity current,
            long version
    ) {
        validateVersion(current, version);
        ensureSupportedType(current.type());
        if ("TRANSFER".equals(current.type())) {
            return deleteTransfer(userId, current);
        }
        return accountRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(current.accountId(), userId, "ACTIVE")
                .filter(value -> value.ledgerId().equals(current.ledgerId()))
                .switchIfEmpty(notFound("账户不存在"))
                .flatMap(account -> {
                    BigDecimal reverseDelta = balanceEffect(current.type(), current.amount()).negate();
                    ensureBalanceAvailable(account, reverseDelta);
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    return updateAccountBalance(userId, account, reverseDelta, now)
                            .then(softDeleteTransaction(userId, current, now));
                });
    }

    private Mono<TransactionResponse> updateTransfer(
            Long userId,
            TransactionEntity current,
            UpdateTransactionRequest request
    ) {
        validateTransferRequest(request.accountId(), request.targetAccountId(), request.categoryId());
        Mono<LedgerEntity> ledger = ledgerRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(request.ledgerId(), userId, "ACTIVE")
                .switchIfEmpty(notFound("账本不存在"));

        Map<Long, BigDecimal> deltas = new HashMap<>();
        mergeDelta(deltas, current.accountId(), current.amount());
        mergeDelta(deltas, current.targetAccountId(), current.amount().negate());
        mergeDelta(deltas, request.accountId(), request.amount().negate());
        mergeDelta(deltas, request.targetAccountId(), request.amount());

        Mono<Map<Long, AccountEntity>> accounts = Flux.fromIterable(deltas.keySet())
                .concatMap(accountId -> accountRepository
                        .findByIdAndUserIdAndStatusAndDeletedAtIsNull(accountId, userId, "ACTIVE")
                        .filter(account -> account.ledgerId().equals(request.ledgerId()))
                        .switchIfEmpty(notFound("转账账户不存在")))
                .collectMap(AccountEntity::id);

        return ledger.then(accounts)
                .flatMap(found -> {
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    return applyAccountDeltas(userId, found, deltas, now)
                            .then(updateTransferTransaction(userId, current, request, now))
                            .thenReturn(new TransactionResponse(
                                    current.id().toString(),
                                    current.requestId(),
                                    request.ledgerId().toString(),
                                    "TRANSFER",
                                    request.accountId().toString(),
                                    found.get(request.accountId()).name(),
                                    request.targetAccountId().toString(),
                                    found.get(request.targetAccountId()).name(),
                                    null,
                                    null,
                                    request.amount(),
                                    null,
                                    offsetDateTime(localDateTime(request.occurredAt())),
                                    normalizeNote(request.note()),
                                    current.source(),
                                    current.status(),
                                    current.version() + 1
                            ));
                });
    }

    private Mono<Void> deleteTransfer(Long userId, TransactionEntity current) {
        Map<Long, BigDecimal> deltas = new HashMap<>();
        mergeDelta(deltas, current.accountId(), current.amount());
        mergeDelta(deltas, current.targetAccountId(), current.amount().negate());
        return Flux.fromIterable(deltas.keySet())
                .concatMap(accountId -> accountRepository
                        .findByIdAndUserIdAndStatusAndDeletedAtIsNull(accountId, userId, "ACTIVE")
                        .filter(account -> account.ledgerId().equals(current.ledgerId()))
                        .switchIfEmpty(notFound("转账账户不存在")))
                .collectMap(AccountEntity::id)
                .flatMap(accounts -> {
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    return applyAccountDeltas(userId, accounts, deltas, now)
                            .then(softDeleteTransaction(userId, current, now));
                });
    }

    private Mono<Void> applyAccountDeltas(
            Long userId,
            Map<Long, AccountEntity> accounts,
            Map<Long, BigDecimal> deltas,
            LocalDateTime now
    ) {
        return Flux.fromStream(deltas.keySet().stream().sorted())
                .concatMap(accountId -> {
                    AccountEntity account = accounts.get(accountId);
                    BigDecimal delta = deltas.get(accountId);
                    ensureBalanceAvailable(account, delta);
                    return updateAccountBalance(userId, account, delta, now);
                })
                .then();
    }

    private void mergeDelta(Map<Long, BigDecimal> deltas, Long accountId, BigDecimal delta) {
        deltas.merge(accountId, delta, BigDecimal::add);
    }

    private Mono<Void> applyUpdateBalance(
            Long userId,
            TransactionEntity current,
            UpdateTransactionRequest request,
            AccountEntity oldAccount,
            AccountEntity newAccount,
            LocalDateTime now
    ) {
        BigDecimal oldEffect = balanceEffect(current.type(), current.amount());
        BigDecimal newEffect = balanceEffect(request.type(), request.amount());
        if (oldAccount.id().equals(newAccount.id())) {
            BigDecimal delta = newEffect.subtract(oldEffect);
            ensureBalanceAvailable(oldAccount, delta);
            return updateAccountBalance(userId, oldAccount, delta, now);
        }

        BigDecimal oldDelta = oldEffect.negate();
        ensureBalanceAvailable(oldAccount, oldDelta);
        ensureBalanceAvailable(newAccount, newEffect);
        return updateAccountBalance(userId, oldAccount, oldDelta, now)
                .then(updateAccountBalance(userId, newAccount, newEffect, now));
    }

    private Mono<Void> updateTransaction(
            Long userId,
            TransactionEntity current,
            UpdateTransactionRequest request,
            LocalDateTime now
    ) {
        DatabaseClient.GenericExecuteSpec spec = databaseClient.sql("""
                        UPDATE transactions
                        SET ledger_id = :ledgerId,
                            account_id = :accountId,
                            category_id = :categoryId,
                            type = :type,
                            amount = :amount,
                            occurred_at = :occurredAt,
                            note = :note,
                            version = version + 1,
                            updated_at = :now
                        WHERE id = :transactionId
                          AND user_id = :userId
                          AND version = :version
                          AND deleted_at IS NULL
                """)
                .bind("ledgerId", request.ledgerId())
                .bind("accountId", request.accountId())
                .bind("type", request.type())
                .bind("amount", request.amount())
                .bind("occurredAt", localDateTime(request.occurredAt()))
                .bind("now", now)
                .bind("transactionId", current.id())
                .bind("userId", userId)
                .bind("version", current.version());
        spec = bindNullable(spec, "categoryId", request.categoryId(), Long.class);
        spec = bindNullable(spec, "note", normalizeNote(request.note()), String.class);
        return spec.fetch()
                .rowsUpdated()
                .flatMap(updated -> updated == 1
                        ? Mono.empty()
                        : versionConflict());
    }

    private Mono<Void> updateTransferTransaction(
            Long userId,
            TransactionEntity current,
            UpdateTransactionRequest request,
            LocalDateTime now
    ) {
        DatabaseClient.GenericExecuteSpec spec = databaseClient.sql("""
                        UPDATE transactions
                        SET ledger_id = :ledgerId,
                            account_id = :accountId,
                            target_account_id = :targetAccountId,
                            category_id = NULL,
                            amount = :amount,
                            occurred_at = :occurredAt,
                            note = :note,
                            version = version + 1,
                            updated_at = :now
                        WHERE id = :transactionId
                          AND user_id = :userId
                          AND version = :version
                          AND deleted_at IS NULL
                        """)
                .bind("ledgerId", request.ledgerId())
                .bind("accountId", request.accountId())
                .bind("targetAccountId", request.targetAccountId())
                .bind("amount", request.amount())
                .bind("occurredAt", localDateTime(request.occurredAt()))
                .bind("now", now)
                .bind("transactionId", current.id())
                .bind("userId", userId)
                .bind("version", current.version());
        spec = bindNullable(spec, "note", normalizeNote(request.note()), String.class);
        return spec.fetch().rowsUpdated()
                .flatMap(updated -> updated == 1 ? Mono.empty() : versionConflict());
    }

    private Mono<Void> softDeleteTransaction(
            Long userId,
            TransactionEntity current,
            LocalDateTime now
    ) {
        return databaseClient.sql("""
                        UPDATE transactions
                        SET deleted_at = :now,
                            updated_at = :now,
                            version = version + 1
                        WHERE id = :transactionId
                          AND user_id = :userId
                          AND version = :version
                          AND deleted_at IS NULL
                        """)
                .bind("now", now)
                .bind("transactionId", current.id())
                .bind("userId", userId)
                .bind("version", current.version())
                .fetch()
                .rowsUpdated()
                .flatMap(updated -> updated == 1
                        ? Mono.empty()
                        : versionConflict());
    }

    private Mono<Void> updateBalance(
            Long userId,
            AccountEntity account,
            String type,
            BigDecimal amount,
            LocalDateTime now
    ) {
        BigDecimal delta = balanceEffect(type, amount);
        return updateAccountBalance(userId, account, delta, now);
    }

    private Mono<Void> updateAccountBalance(
            Long userId,
            AccountEntity account,
            BigDecimal delta,
            LocalDateTime now
    ) {
        if (delta.signum() == 0) {
            return Mono.empty();
        }
        return databaseClient.sql("""
                        UPDATE accounts
                        SET balance = balance + :delta,
                            version = version + 1,
                            balance_updated_at = :now,
                            updated_at = :now
                        WHERE id = :accountId
                          AND user_id = :userId
                          AND ledger_id = :ledgerId
                          AND version = :version
                          AND status = 'ACTIVE'
                          AND deleted_at IS NULL
                        """)
                .bind("delta", delta)
                .bind("now", now)
                .bind("accountId", account.id())
                .bind("userId", userId)
                .bind("ledgerId", account.ledgerId())
                .bind("version", account.version())
                .fetch()
                .rowsUpdated()
                .flatMap(updated -> updated == 1
                        ? Mono.empty()
                        : versionConflict());
    }

    private void validateIncomeOrExpenseRequest(Long targetAccountId, Long categoryId) {
        if (targetAccountId != null) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "收支账单不能设置目标账户");
        }
        if (categoryId == null) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "收支账单必须选择分类");
        }
    }

    private void validateTransferRequest(Long accountId, Long targetAccountId, Long categoryId) {
        if (targetAccountId == null) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "转账必须选择转入账户");
        }
        if (accountId.equals(targetAccountId)) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "转出和转入账户不能相同");
        }
        if (categoryId != null) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "转账不能设置收支分类");
        }
    }

    private void validateTags(List<Long> tagIds) {
        if (tagIds != null && !tagIds.isEmpty()) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "TAGS_NOT_SUPPORTED", "账单标签将在后续迭代开放");
        }
    }

    private void validateTypeFamily(String currentType, String nextType) {
        boolean currentTransfer = "TRANSFER".equals(currentType);
        boolean nextTransfer = "TRANSFER".equals(nextType);
        if (currentTransfer != nextTransfer) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "TRANSACTION_TYPE_CHANGE_NOT_ALLOWED",
                    "收支账单与转账账单不能互相修改类型"
            );
        }
    }

    private void validateVersion(TransactionEntity transaction, long expectedVersion) {
        if (transaction.version() != expectedVersion) {
            throw new BusinessException(
                    HttpStatus.CONFLICT, "VERSION_CONFLICT", "账单已被其他操作修改，请刷新后重试");
        }
    }

    private void ensureSupportedType(String type) {
        if (!EDITABLE_TYPES.contains(type)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT, "TRANSACTION_TYPE_NOT_SUPPORTED", "当前账单类型暂不支持修改或删除");
        }
    }

    private void ensureBalanceAvailable(AccountEntity account, BigDecimal delta) {
        if (account.balance().add(delta).signum() < 0) {
            throw new BusinessException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "INSUFFICIENT_BALANCE",
                    "账户余额不足，无法完成账单冲销"
            );
        }
    }

    private BigDecimal balanceEffect(String type, BigDecimal amount) {
        return "INCOME".equals(type) ? amount : amount.negate();
    }

    private <T> Mono<T> versionConflict() {
        return Mono.error(new BusinessException(
                HttpStatus.CONFLICT, "VERSION_CONFLICT", "数据已变化，请刷新后重试"));
    }

    private Mono<TransactionResponse> toResponse(TransactionEntity transaction) {
        Mono<AccountEntity> account = accountRepository.findById(transaction.accountId());
        Mono<String> targetAccountName = transaction.targetAccountId() == null
                ? Mono.just("")
                : accountRepository.findById(transaction.targetAccountId())
                        .map(AccountEntity::name)
                        .defaultIfEmpty("");
        Mono<String> categoryName = transaction.categoryId() == null
                ? Mono.just("")
                : categoryRepository.findById(transaction.categoryId())
                        .map(CategoryEntity::name)
                        .defaultIfEmpty("");
        return Mono.zip(account, targetAccountName, categoryName)
                .map(tuple -> toResponse(
                        transaction,
                        tuple.getT1().name(),
                        tuple.getT2().isEmpty() ? null : tuple.getT2(),
                        tuple.getT3().isEmpty() ? null : tuple.getT3()
                ));
    }

    private TransactionResponse toResponse(
            TransactionEntity transaction,
            String accountName,
            String targetAccountName,
            String categoryName
    ) {
        return new TransactionResponse(
                transaction.id().toString(),
                transaction.requestId(),
                transaction.ledgerId().toString(),
                transaction.type(),
                transaction.accountId().toString(),
                accountName,
                transaction.targetAccountId() == null ? null : transaction.targetAccountId().toString(),
                targetAccountName,
                transaction.categoryId() == null ? null : transaction.categoryId().toString(),
                categoryName,
                transaction.amount(),
                transaction.balanceDelta(),
                offsetDateTime(transaction.occurredAt()),
                transaction.note(),
                transaction.source(),
                transaction.status(),
                transaction.version()
        );
    }

    private <T> Mono<T> notFound(String message) {
        return Mono.error(new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", message));
    }

    private DatabaseClient.GenericExecuteSpec bindNullable(
            DatabaseClient.GenericExecuteSpec spec,
            String name,
            Object value,
            Class<?> type
    ) {
        return value == null ? spec.bindNull(name, type) : spec.bind(name, value);
    }

    private String normalizeNote(String note) {
        if (note == null || note.isBlank()) {
            return null;
        }
        return note.trim();
    }

    private LocalDateTime localDateTime(OffsetDateTime value) {
        return value == null ? null : value.atZoneSameInstant(BUSINESS_ZONE).toLocalDateTime();
    }

    private OffsetDateTime offsetDateTime(LocalDateTime value) {
        return value == null ? null : value.atZone(BUSINESS_ZONE).toOffsetDateTime();
    }

    private String stringId(Number value) {
        return value == null ? null : Long.toString(value.longValue());
    }

    private long number(Number value) {
        return value == null ? 0 : value.longValue();
    }
}
