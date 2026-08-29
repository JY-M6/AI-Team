package com.qianji.ledger;

import com.qianji.common.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class CategoryService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Shanghai");

    private final CategoryRepository categoryRepository;
    private final DatabaseClient databaseClient;
    private final TransactionalOperator transactionalOperator;

    public CategoryService(
            CategoryRepository categoryRepository,
            DatabaseClient databaseClient,
            TransactionalOperator transactionalOperator
    ) {
        this.categoryRepository = categoryRepository;
        this.databaseClient = databaseClient;
        this.transactionalOperator = transactionalOperator;
    }

    public Flux<CategoryResponse> findAll(Long userId, String type) {
        Flux<CategoryEntity> system = databaseClient.sql("""
                        SELECT * FROM categories
                        WHERE user_id IS NULL AND type = :type
                          AND status = 'ACTIVE' AND deleted_at IS NULL
                        ORDER BY sort_order, id
                        """)
                .bind("type", type)
                .mapProperties(CategoryEntity.class)
                .all();
        Flux<CategoryEntity> custom = categoryRepository
                .findAllByUserIdAndTypeAndDeletedAtIsNullOrderBySortOrderAsc(userId, type)
                .filter(category -> "ACTIVE".equals(category.status()));
        return system.concatWith(custom).map(CategoryResponse::from);
    }

    public Mono<CategoryResponse> create(Long userId, CreateCategoryRequest request) {
        String name = request.name().trim();
        return ensureNameAvailable(userId, request.type(), name)
                .then(categoryRepository.save(new CategoryEntity(
                        null,
                        userId,
                        null,
                        request.type(),
                        null,
                        name,
                        normalize(request.icon()),
                        request.color(),
                        false,
                        "ACTIVE",
                        request.sortOrder() == null ? 0 : request.sortOrder(),
                        LocalDateTime.now(BUSINESS_ZONE),
                        LocalDateTime.now(BUSINESS_ZONE),
                        null
                )))
                .map(CategoryResponse::from);
    }

    public Mono<CategoryResponse> update(Long userId, Long categoryId, UpdateCategoryRequest request) {
        Mono<CategoryResponse> operation = categoryRepository
                .findByIdAndUserIdAndDeletedAtIsNull(categoryId, userId)
                .switchIfEmpty(notFound("自定义分类不存在"))
                .flatMap(current -> {
                    if (!current.type().equals(request.type())) {
                        return Mono.error(new BusinessException(
                                HttpStatus.CONFLICT,
                                "CATEGORY_TYPE_CHANGE_NOT_ALLOWED",
                                "分类类型创建后不能修改"
                        ));
                    }
                    String name = request.name().trim();
                    Mono<Void> unique = current.name().equals(name)
                            ? Mono.empty()
                            : ensureNameAvailable(userId, request.type(), name);
                    return unique.then(updateCategory(userId, current, request, name));
                });
        return transactionalOperator.transactional(operation);
    }

    public Mono<Void> delete(Long userId, Long categoryId) {
        Mono<Void> operation = categoryRepository
                .findByIdAndUserIdAndDeletedAtIsNull(categoryId, userId)
                .switchIfEmpty(notFound("自定义分类不存在"))
                .flatMap(current -> {
                    LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
                    return databaseClient.sql("""
                                    UPDATE categories
                                    SET status = 'DISABLED', deleted_at = :now, updated_at = :now
                                    WHERE id = :categoryId AND user_id = :userId
                                      AND is_system = 0 AND deleted_at IS NULL
                                    """)
                            .bind("now", now)
                            .bind("categoryId", categoryId)
                            .bind("userId", userId)
                            .fetch().rowsUpdated()
                            .flatMap(updated -> updated == 1 ? Mono.empty() : notFound("自定义分类不存在"));
                });
        return transactionalOperator.transactional(operation);
    }

    private Mono<CategoryResponse> updateCategory(
            Long userId,
            CategoryEntity current,
            UpdateCategoryRequest request,
            String name
    ) {
        DatabaseClient.GenericExecuteSpec spec = databaseClient.sql("""
                        UPDATE categories
                        SET type = :type, name = :name, icon = :icon,
                            color = :color, sort_order = :sortOrder, updated_at = :now
                        WHERE id = :categoryId AND user_id = :userId
                          AND is_system = 0 AND deleted_at IS NULL
                        """)
                .bind("type", request.type())
                .bind("name", name)
                .bind("sortOrder", request.sortOrder() == null ? 0 : request.sortOrder())
                .bind("now", LocalDateTime.now(BUSINESS_ZONE))
                .bind("categoryId", current.id())
                .bind("userId", userId);
        spec = bindNullable(spec, "icon", normalize(request.icon()), String.class);
        spec = bindNullable(spec, "color", request.color(), String.class);
        return spec.fetch().rowsUpdated()
                .flatMap(updated -> updated == 1
                        ? categoryRepository.findById(current.id()).map(CategoryResponse::from)
                        : notFound("自定义分类不存在"));
    }

    private Mono<Void> ensureNameAvailable(Long userId, String type, String name) {
        return categoryRepository.existsByUserIdAndTypeAndNameAndDeletedAtIsNull(userId, type, name)
                .flatMap(exists -> exists
                        ? Mono.error(new BusinessException(
                                HttpStatus.CONFLICT,
                                "CATEGORY_NAME_EXISTS",
                                "同类型中已存在同名自定义分类"))
                        : Mono.empty());
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private DatabaseClient.GenericExecuteSpec bindNullable(
            DatabaseClient.GenericExecuteSpec spec,
            String name,
            Object value,
            Class<?> type
    ) {
        return value == null ? spec.bindNull(name, type) : spec.bind(name, value);
    }

    private <T> Mono<T> notFound(String message) {
        return Mono.error(new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", message));
    }
}
