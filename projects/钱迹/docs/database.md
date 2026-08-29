# 钱迹数据库文档

> 版本：P0 数据库基线
>
> 更新时间：2026-07-14
>
> 数据库：MySQL 8
>
> 迁移状态：本地 MySQL 8 的 `qianji` 数据库已完成 V1/V2/V3/V4，4 条迁移均为成功状态。

## 一、迁移文件

| 版本 | 文件 | 内容 |
|---|---|---|
| V1 | `backend/src/main/resources/db/migration/V1__create_core_schema.sql` | 用户、鉴权、账本、账户、分类、标签、账单、预算和 AI 授权 |
| V2 | `backend/src/main/resources/db/migration/V2__seed_system_categories.sql` | 默认收入与支出分类 |
| V3 | `backend/src/main/resources/db/migration/V3__add_ai_validation_audit.sql` | AI 输出校验状态、校验器版本、结果来源和结果摘要 |
| V4 | `backend/src/main/resources/db/migration/V4__add_transaction_balance_delta.sql` | 为余额校准流水增加有符号差额 `balance_delta` |

已发布的迁移文件不得直接修改；结构变更必须新增更高版本迁移。

## 二、P0 表结构

| 表 | 作用 | 关键约束 |
|---|---|---|
| `users` | 用户资料和隐私偏好 | 手机号哈希唯一、乐观锁、软删除 |
| `user_auths` | 用户名、手机号和微信认证方式 | `provider + provider_uid` 唯一，不保存明文密码 |
| `user_sessions` | 刷新令牌与设备会话 | 只保存令牌哈希，支持撤销和过期 |
| `ledgers` | 用户账本 | P0 只展示默认账本，表结构保留扩展能力 |
| `accounts` | 现金、微信、银行卡等资金账户 | 保存 `balance` 快照和 `version` |
| `categories` | 系统与自定义收支分类 | 系统分类编码稳定，支持父子层级 |
| `tags` | 用户自定义账单标签 | 按用户隔离 |
| `transactions` | 收入、支出、转账和余额调整 | 正金额、幂等键、乐观锁、单流水双账户 |
| `transaction_tags` | 账单与标签多对多关系 | 联合主键 |
| `budgets` | 月总预算和分类预算 | 生成列统一总预算与分类预算唯一作用域 |
| `ai_authorizations` | AI 可读取的数据范围 | `user_id + scope` 唯一，可撤销 |
| `ai_analysis_records` | AI 单次分析状态与结构化结果 | 只保存校验后结果，记录校验状态、版本、来源、摘要和 Token 用量 |

## 三、金额与余额规则

- 所有金额使用 `DECIMAL(19, 2)`，禁止 `FLOAT` 和 `DOUBLE`。
- `transactions.amount` 始终为正数，收支方向由 `type` 决定。
- `ADJUSTMENT` 流水使用 `balance_delta` 保存有符号差额，其他类型该字段必须为空。
- `accounts.balance` 是当前余额快照，不在首页实时聚合全部流水。
- 新增、修改、删除账单必须在同一响应式事务中更新流水和账户余额。
- 余额更新必须携带 `version` 或执行带条件的原子更新，更新行数为 0 时返回 `VERSION_CONFLICT`。
- 手工校准余额时，系统计算差额并生成 `ADJUSTMENT` 类型流水，不允许直接静默覆盖余额。

## 四、转账一致性

转账使用一条 `TRANSFER` 流水：

```text
account_id         转出账户
target_account_id  转入账户
amount             正数转账金额
```

业务层必须校验：

1. 两个账户不同且都属于当前用户。
2. 两个账户属于允许互转的账本和币种。
3. 扣减转出余额、增加转入余额和写入流水在同一事务中完成。
4. 修改或删除转账时先冲销旧影响，再应用新值。
5. 并发更新账户时按账户 ID 升序处理，减少死锁概率。
6. `request_id` 在当前用户范围内唯一，重试不得重复扣款。

## 五、查询与索引

账单主查询索引：

```text
(user_id, ledger_id, occurred_at, id)
(account_id, occurred_at, id)
(target_account_id, occurred_at, id)
(category_id, occurred_at, id)
```

日历、明细和统计查询必须先限定当前用户与时间范围。列表采用游标分页，禁止无上限扫描全部流水。

## 六、删除与隐私

- 普通账单、账户、分类和用户资料默认软删除。
- 删除账单前必须先冲销对应账户余额影响。
- 手机号保存密文和检索哈希，日志只能显示脱敏值。
- 密码、刷新令牌和 API Key 只保存不可逆哈希或加密密文。
- AI 分析仅保存脱敏输入摘要和校验后的结果，不保存完整账单上下文或失败的模型原文。
- 用户销户的物理清理流程在实现账号生命周期前单独设计和验证。

## 七、缓存边界

P0 已引入 Caffeine 依赖，但当前统计接口直接查询确定性流水，尚未启用统计缓存。后续启用时缓存键必须至少包含：

```text
user_id + ledger_id + 统计粒度 + 时间范围
```

默认容量为 2000，写入后 10 分钟过期。账单发生新增、修改或删除后，必须失效对应账本和时间范围的统计缓存。多实例部署前不引入 Redis。

## 八、迁移验证

1. Flyway V1/V2/V3/V4 均已执行，`success=1`。
2. 当前共有 13 张表，其中包含 `flyway_schema_history`。
3. 系统分类共 14 条。
4. `ai_analysis_records` 已包含 `validation_status`、`validator_version`、`result_source` 和 `result_digest`。

已通过 H2 集成测试验证账户校准、转账幂等/修改/删除、分类隔离、统计和预算业务链路。真实 MySQL 已验证 V4 字段与 CHECK 约束；预算生成列唯一索引和高并发冲突仍需专项验证。
