CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户主键',
    nickname VARCHAR(64) NOT NULL COMMENT '用户昵称',
    avatar_url VARCHAR(512) NULL COMMENT '头像地址',
    phone_ciphertext VARBINARY(512) NULL COMMENT '加密手机号',
    phone_hash CHAR(64) NULL COMMENT '手机号检索哈希',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' COMMENT '用户状态',
    privacy_mode TINYINT(1) NOT NULL DEFAULT 0 COMMENT '隐私模式',
    version BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_phone_hash (phone_hash),
    KEY idx_users_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户';

CREATE TABLE user_auths (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    provider VARCHAR(32) NOT NULL COMMENT 'USERNAME、PHONE或WECHAT',
    provider_uid VARCHAR(128) NOT NULL COMMENT '供应商侧唯一标识',
    credential_hash VARCHAR(255) NULL COMMENT '密码等凭证哈希',
    verified TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_auth_provider_uid (provider, provider_uid),
    KEY idx_user_auths_user (user_id, provider),
    CONSTRAINT fk_user_auths_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户认证方式';

CREATE TABLE user_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    refresh_token_hash CHAR(64) NOT NULL COMMENT '刷新令牌哈希',
    device_id VARCHAR(128) NULL,
    device_name VARCHAR(128) NULL,
    expires_at DATETIME(3) NOT NULL,
    revoked_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_sessions_token (refresh_token_hash),
    KEY idx_user_sessions_user_active (user_id, revoked_at, expires_at),
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户设备会话';

CREATE TABLE ledgers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'PERSONAL',
    currency CHAR(3) NOT NULL DEFAULT 'CNY',
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) NULL,
    PRIMARY KEY (id),
    KEY idx_ledgers_user_status (user_id, status),
    CONSTRAINT fk_ledgers_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='账本';

CREATE TABLE accounts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    ledger_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL COMMENT 'CASH、WECHAT、ALIPAY、BANK_CARD等',
    balance DECIMAL(19, 2) NOT NULL DEFAULT 0.00 COMMENT '当前余额快照',
    currency CHAR(3) NOT NULL DEFAULT 'CNY',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    version BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '余额并发更新版本',
    balance_updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) NULL,
    PRIMARY KEY (id),
    KEY idx_accounts_user_ledger (user_id, ledger_id, status),
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_accounts_ledger FOREIGN KEY (ledger_id) REFERENCES ledgers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='资金账户';

CREATE TABLE categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL COMMENT '为空表示系统分类',
    parent_id BIGINT UNSIGNED NULL,
    type VARCHAR(16) NOT NULL COMMENT 'EXPENSE或INCOME',
    code VARCHAR(64) NULL COMMENT '系统分类稳定编码',
    name VARCHAR(64) NOT NULL,
    icon VARCHAR(64) NULL,
    color CHAR(7) NULL,
    is_system TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_type_code (type, code),
    KEY idx_categories_user_type (user_id, type, status),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='收支分类';

CREATE TABLE tags (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(32) NOT NULL,
    color CHAR(7) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) NULL,
    PRIMARY KEY (id),
    KEY idx_tags_user_name (user_id, name),
    CONSTRAINT fk_tags_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='账单标签';

CREATE TABLE transactions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    ledger_id BIGINT UNSIGNED NOT NULL,
    account_id BIGINT UNSIGNED NOT NULL COMMENT '收支账户或转出账户',
    target_account_id BIGINT UNSIGNED NULL COMMENT '转账目标账户',
    category_id BIGINT UNSIGNED NULL,
    request_id VARCHAR(64) NULL COMMENT '客户端幂等请求标识',
    type VARCHAR(16) NOT NULL COMMENT 'EXPENSE、INCOME、TRANSFER或ADJUSTMENT',
    amount DECIMAL(19, 2) NOT NULL COMMENT '始终保存正数',
    occurred_at DATETIME(3) NOT NULL COMMENT '实际发生时间，精确到毫秒',
    note VARCHAR(500) NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'MANUAL' COMMENT 'MANUAL、RECURRING、IMPORT或SYSTEM',
    status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
    is_system TINYINT(1) NOT NULL DEFAULT 0,
    version BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_transactions_user_request (user_id, request_id),
    KEY idx_transactions_user_ledger_time (user_id, ledger_id, occurred_at, id),
    KEY idx_transactions_account_time (account_id, occurred_at, id),
    KEY idx_transactions_target_account_time (target_account_id, occurred_at, id),
    KEY idx_transactions_category_time (category_id, occurred_at, id),
    CONSTRAINT chk_transactions_amount CHECK (amount > 0),
    CONSTRAINT chk_transactions_accounts CHECK (
        (type = 'TRANSFER' AND target_account_id IS NOT NULL AND target_account_id <> account_id)
        OR (type <> 'TRANSFER' AND target_account_id IS NULL)
    ),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_transactions_ledger FOREIGN KEY (ledger_id) REFERENCES ledgers (id),
    CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts (id),
    CONSTRAINT fk_transactions_target_account FOREIGN KEY (target_account_id) REFERENCES accounts (id),
    CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='账单流水';

CREATE TABLE transaction_tags (
    transaction_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (transaction_id, tag_id),
    KEY idx_transaction_tags_tag (tag_id, transaction_id),
    CONSTRAINT fk_transaction_tags_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id),
    CONSTRAINT fk_transaction_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='账单标签关系';

CREATE TABLE budgets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    ledger_id BIGINT UNSIGNED NOT NULL,
    budget_month DATE NOT NULL COMMENT '固定为当月第一天',
    category_id BIGINT UNSIGNED NULL COMMENT '为空表示总预算',
    category_scope_id BIGINT UNSIGNED GENERATED ALWAYS AS (IFNULL(category_id, 0)) STORED,
    amount DECIMAL(19, 2) NOT NULL,
    alert_threshold DECIMAL(5, 2) NOT NULL DEFAULT 80.00,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    version BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_budgets_scope (user_id, ledger_id, budget_month, category_scope_id),
    CONSTRAINT chk_budgets_amount CHECK (amount > 0),
    CONSTRAINT chk_budgets_threshold CHECK (alert_threshold > 0 AND alert_threshold <= 100),
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_budgets_ledger FOREIGN KEY (ledger_id) REFERENCES ledgers (id),
    CONSTRAINT fk_budgets_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='月度预算';

CREATE TABLE ai_authorizations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    scope VARCHAR(64) NOT NULL COMMENT '授权的数据范围',
    enabled TINYINT(1) NOT NULL DEFAULT 0,
    consent_version VARCHAR(32) NOT NULL,
    granted_at DATETIME(3) NULL,
    revoked_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_ai_authorizations_user_scope (user_id, scope),
    CONSTRAINT fk_ai_authorizations_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI 数据授权';

CREATE TABLE ai_analysis_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    scene VARCHAR(64) NOT NULL,
    period_start DATETIME(3) NULL,
    period_end DATETIME(3) NULL,
    input_digest CHAR(64) NOT NULL COMMENT '脱敏输入摘要',
    result_json JSON NULL COMMENT '校验后的结构化结果',
    model VARCHAR(128) NULL,
    status VARCHAR(32) NOT NULL COMMENT 'PENDING、COMPLETED、FAILED或CANCELLED',
    error_code VARCHAR(64) NULL,
    prompt_tokens INT UNSIGNED NULL,
    completion_tokens INT UNSIGNED NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_ai_analysis_user_scene_time (user_id, scene, created_at),
    KEY idx_ai_analysis_digest (user_id, scene, input_digest, status),
    CONSTRAINT fk_ai_analysis_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI 单次分析记录';
