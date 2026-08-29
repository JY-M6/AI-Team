# 钱迹后端

钱迹后端采用 Java 21、Spring Boot 3 WebFlux、Spring Data R2DBC 和 MySQL 8。当前已完成 P0 核心后端：认证、账本、账户、收支与转账、分类、日历统计、预算和 AI 输出校验门。

## 环境要求

- JDK 21
- Maven 3.6.3+
- MySQL 8

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `QIANJI_SERVER_PORT` | `8080` | 后端端口 |
| `QIANJI_R2DBC_URL` | `r2dbc:mysql://127.0.0.1:3306/qianji...` | 运行时响应式数据库地址 |
| `QIANJI_JDBC_URL` | `jdbc:mysql://127.0.0.1:3306/qianji...` | Flyway 启动迁移地址 |
| `QIANJI_DB_USERNAME` | `qianji` | 数据库用户名 |
| `QIANJI_DB_PASSWORD` | `qianji` | 数据库密码；正式环境必须覆盖 |
| `QIANJI_FLYWAY_ENABLED` | `true` | 是否执行 Flyway 迁移 |
| `QIANJI_JWT_SECRET` | 仅开发默认值 | HS256 JWT 密钥；正式环境必须使用至少 32 字节的随机值覆盖 |

不要把真实数据库密码、JWT 密钥或 AI API Key 提交到仓库。

## 运行测试

```bash
mvn test
```

测试使用内存 H2 并关闭 Flyway，不连接本机 MySQL。当前 16 个测试覆盖认证、默认数据、账户管理与余额校准、收支和转账完整生命周期、自定义分类隔离、日历、日周月年统计、总预算与分类预算、幂等、越权、余额不足、乐观锁和 AI 输出校验。

## 本地启动

先创建空的 MySQL 数据库与专用用户，再配置环境变量：

```powershell
$env:QIANJI_DB_USERNAME="qianji"
$env:QIANJI_DB_PASSWORD="本地数据库密码"
mvn spring-boot:run
```

启动时 Flyway 自动执行：

```text
V1__create_core_schema.sql
V2__seed_system_categories.sql
V3__add_ai_validation_audit.sql
V4__add_transaction_balance_delta.sql
```

V4 用于余额校准流水的有符号差额字段。2026-07-29 已在备份后通过 Flyway 应用到本机 `qianji` 数据库，并验证字段与 CHECK 约束存在。

连通性接口：

```text
GET http://127.0.0.1:8080/api/v1/system/status
GET http://127.0.0.1:8080/actuator/health
```

## 当前边界

- 已实现用户名密码注册登录、JWT、刷新令牌轮换、退出撤销和当前用户查询。
- 注册会在同一响应式事务中创建默认账本及现金、微信、支付宝账户。
- 已实现当前用户账本和账户余额快照查询，Repository 查询条件强制包含当前用户 ID。
- 已实现收入/支出新增和流水基础筛选；流水写入与账户余额更新处于同一响应式事务。
- 已实现收入/支出详情、修改和软删除；修改或删除会冲销余额，账单与账户均使用乐观锁防止并发覆盖。
- 已实现账户新增、修改、停用和余额校准；校准会生成 `ADJUSTMENT` 系统流水。
- 已实现单流水双账户转账创建、查询、修改和删除；转账在同一响应式事务中更新双方余额。
- 已实现系统/自定义分类查询与自定义分类增改删，系统分类只读。
- 已实现月历以及日、周、月、年汇总、趋势和分类统计。
- 已实现月总预算与分类预算，返回已用、剩余、使用率、提醒和超支状态。
- 已配置 R2DBC；本地 MySQL 8 已完成 V1/V2/V3 迁移验证，共 13 张表、14 条系统分类。
- AI 模型原文必须经过 `AiModelOutputValidator` 校验；后续 SSE 只能重放已校验结果，不能透传上游 token。
- 标签、复制账单、关键词搜索、游标分页和 AI SSE 接口将在后续迭代实现。
- Flyway 使用 JDBC 仅限启动迁移；业务运行路径禁止使用 JDBC 或 MyBatis-Plus。
