# 钱迹接口文档

> 版本：v1 草案
>
> 更新时间：2026-07-13
>
> 后端基线：Java 21 + Spring Boot WebFlux + R2DBC
>
> 状态说明：本文件是前后端联调契约；只有标记为“已实现”的接口可以视为当前可调用能力。

## 一、通用约定

### 基础路径

```text
/api/v1
```

### 数据格式

- 请求和普通响应使用 `application/json; charset=UTF-8`。
- AI 流式响应使用 `text/event-stream; charset=UTF-8`。
- 数据库主键在 JSON 中使用字符串，避免 JavaScript 大整数精度丢失。
- 金额使用十进制字符串，例如 `"168.00"`，禁止前端使用浮点结果覆盖服务端金额。
- 时间使用 ISO 8601 并携带时区，例如 `2026-07-13T21:30:00+08:00`。
- 账单发生时间支持补记往期和预记未来，服务端保存时统一转换为标准时间。

### 鉴权

除公开接口外，请求头统一携带：

```http
Authorization: Bearer <access-token>
```

业务接口从认证上下文取得当前用户 ID，禁止客户端传入或覆盖 `userId`。

### 成功响应

```json
{
  "code": "OK",
  "message": "成功",
  "data": {},
  "timestamp": "2026-07-13T13:30:00Z"
}
```

### 失败响应

```json
{
  "code": "VALIDATION_ERROR",
  "message": "amount：金额必须大于 0",
  "path": "/api/v1/transactions",
  "timestamp": "2026-07-13T13:30:00Z"
}
```

### 列表分页

流水类列表采用游标分页：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `cursor` | string | 否 | 上一页返回的游标 |
| `limit` | integer | 否 | 默认 20，最大 100 |

```json
{
  "items": [],
  "nextCursor": "opaque-cursor",
  "hasMore": false
}
```

## 二、当前已实现接口

### 系统状态

```http
GET /api/v1/system/status
```

无需鉴权。当前用于开发环境和前端连通性检查。

```json
{
  "code": "OK",
  "message": "成功",
  "data": {
    "service": "qianji-backend",
    "status": "UP"
  },
  "timestamp": "2026-07-13T13:30:00Z"
}
```

## 三、P0 接口契约

以下接口为已确定的联调契约，具体实现状态以表格和“七、实现状态”为准。

### 1. 认证与用户（部分已实现）

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/auth/register` | 已实现：用户名与密码注册，同时创建默认账本和账户 |
| `POST` | `/auth/login` | 已实现：用户名与密码登录 |
| `POST` | `/auth/refresh` | 已实现：轮换访问令牌和刷新令牌 |
| `POST` | `/auth/logout` | 已实现：撤销当前刷新会话 |
| `GET` | `/users/me` | 已实现：获取当前用户资料 |
| `PUT` | `/users/me` | 待实现：修改昵称、头像和隐私偏好 |

注册请求：

```json
{
  "username": "qianji_user",
  "password": "用户输入的密码",
  "nickname": "钱迹用户",
  "deviceId": "web-browser-id",
  "deviceName": "Windows Web"
}
```

用户名保存前会去除首尾空白并转为小写。密码长度为 8 至 72 个字符，且 UTF-8 编码不得超过 72 字节。

登录请求：

```json
{
  "username": "qianji_user",
  "password": "用户输入的密码",
  "deviceId": "web-browser-id",
  "deviceName": "Windows Web"
}
```

登录和注册响应：

```json
{
  "tokenType": "Bearer",
  "accessToken": "短期 JWT",
  "expiresInSeconds": 1800,
  "refreshToken": "只在签发时返回的随机令牌",
  "user": {
    "id": "1",
    "nickname": "钱迹用户"
  }
}
```

刷新请求：

```json
{
  "refreshToken": "当前有效刷新令牌"
}
```

`accessToken` 默认有效期为 30 分钟。`refreshToken` 每次刷新后立即轮换，旧令牌立即失效，服务端只保存 SHA-256 哈希。退出登录会撤销刷新会话；已签发的访问令牌最多继续有效至自身过期。

### 2. 账本、账户、分类和标签

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/ledgers` | 已实现：查询当前用户账本；P0 默认只有一个账本 |
| `GET` | `/accounts` | 已实现：查询当前用户资金账户及余额快照 |
| `POST` | `/accounts` | 已实现：新增账户 |
| `PUT` | `/accounts/{id}` | 已实现：修改账户名称和类型 |
| `DELETE` | `/accounts/{id}?version=3` | 已实现：余额为 0 时停用账户 |
| `POST` | `/accounts/{id}/balance-adjustments` | 已实现：校准余额并生成系统平账流水 |
| `GET` | `/categories?type=EXPENSE` | 已实现：查询系统分类和用户自定义分类 |
| `POST` | `/categories` | 已实现：新增自定义分类 |
| `PUT` | `/categories/{id}` | 已实现：修改自定义分类 |
| `DELETE` | `/categories/{id}` | 已实现：软删除自定义分类 |
| `GET` | `/tags` | P1 待实现：查询标签 |
| `POST` | `/tags` | P1 待实现：新增标签 |
| `DELETE` | `/tags/{id}` | P1 待实现：删除标签 |

余额校准请求：

```json
{
  "requestId": "balance-adjust-20260713-001",
  "targetBalance": "5200.00",
  "occurredAt": "2026-07-13T21:30:00+08:00",
  "note": "银行卡余额校准",
  "version": 3
}
```

### 3. 账单流水

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/transactions` | 已实现：新增收入、支出或转账并更新账户余额 |
| `GET` | `/transactions` | 已实现：按时间倒序查询并支持基础筛选 |
| `GET` | `/transactions/{id}` | 已实现：查询当前用户账单详情 |
| `PUT` | `/transactions/{id}` | 已实现：修改收入、支出或转账并校验乐观锁 |
| `DELETE` | `/transactions/{id}?version=3` | 已实现：软删除账单并冲销余额影响 |
| `POST` | `/transactions/{id}/copies` | 复制账单并生成新请求标识 |

新增账单请求：

```json
{
  "requestId": "web-20260713-000001",
  "ledgerId": "1",
  "type": "EXPENSE",
  "accountId": "10",
  "targetAccountId": null,
  "categoryId": "3",
  "amount": "42.00",
  "occurredAt": "2026-07-13T12:18:00+08:00",
  "note": "午餐套餐",
  "tagIds": ["2"]
}
```

新增转账请求：

```json
{
  "requestId": "web-transfer-20260714-001",
  "ledgerId": "1",
  "type": "TRANSFER",
  "accountId": "10",
  "targetAccountId": "11",
  "categoryId": null,
  "amount": "300.00",
  "occurredAt": "2026-07-14T09:30:00+08:00",
  "note": "现金转入微信",
  "tagIds": []
}
```

转账响应在普通账单字段之外使用 `targetAccountId` 和 `targetAccountName` 表示转入账户；收支账单的这两个字段为 `null`。

修改账单请求：

```json
{
  "ledgerId": "1",
  "type": "EXPENSE",
  "accountId": "10",
  "targetAccountId": null,
  "categoryId": "3",
  "amount": "52.00",
  "occurredAt": "2026-07-13T12:25:00+08:00",
  "note": "午餐和咖啡",
  "tagIds": [],
  "version": 0
}
```

转账规则：

- `type` 为 `TRANSFER` 时必须提供 `targetAccountId`，且不能与 `accountId` 相同。
- 转账金额始终为正数，服务端在同一响应式事务中扣减转出账户并增加转入账户。
- 转出和转入账户必须属于当前用户的同一账本，且不能是同一账户。
- 转账只保存一条流水，`categoryId` 必须为 `null`。
- 其他交易类型不得提供 `targetAccountId`。
- 相同用户的重复 `requestId` 返回第一次成功结果，不重复修改余额。

当前实现边界：

- 新增接口接受 `INCOME`、`EXPENSE` 和 `TRANSFER`。
- 支出账户余额不足时返回 `INSUFFICIENT_BALANCE`。
- 转出账户余额不足时返回 `INSUFFICIENT_BALANCE`，双方余额均不改变。
- 账单、账户、账本和分类都必须属于当前用户允许的范围。
- `tagIds` 当前只能为空数组，标签写入随标签接口后置。
- 余额与流水写入位于同一响应式事务，账户版本冲突返回 `VERSION_CONFLICT`。
- 修改和删除必须携带当前账单 `version`；旧版本返回 `VERSION_CONFLICT`。
- 修改时先冲销旧账单影响，再应用新账单影响；跨账户修改会在同一响应式事务中更新两个账户。
- 删除收入或修改收入所属账户时，如果冲销后账户余额会小于 0，返回 `INSUFFICIENT_BALANCE` 并回滚。
- 删除采用软删除；已删除账单不可查询，同一 `requestId` 不可再次创建账单。
- 转账修改和删除会合并旧、新账户差额，按账户 ID 升序更新并在同一事务中提交。
- 收支账单和转账账单不能互相修改类型。

查询参数：

| 参数 | 说明 |
|---|---|
| `startAt` / `endAt` | 发生时间范围 |
| `type` | `EXPENSE`、`INCOME`、`TRANSFER`、`ADJUSTMENT` |
| `categoryId` | 分类筛选 |
| `accountId` | 账户筛选；转账会匹配转出或转入任一账户 |
| `tagId` | 标签筛选 |
| `keyword` | 搜索备注、分类和金额 |
| `limit` | 已实现；范围 1 至 100，默认 50 |
| `cursor` | 待实现：游标分页 |

当前列表已支持 `ledgerId`、`startAt`、`endAt`、`type`、`categoryId`、`accountId` 和 `limit`；`tagId`、`keyword`、`cursor` 后置。

### 4. 日历与统计

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/calendar/monthly?ledgerId=1&month=2026-07` | 查询每日收支汇总 |
| `GET` | `/reports/summary` | 指定时间范围的收入、支出、结余与笔数 |
| `GET` | `/reports/categories` | 指定时间范围的分类占比 |
| `GET` | `/reports/trend` | 按日、周、月或年返回趋势点 |

统计接口公共参数：

| 参数 | 必填 | 说明 |
|---|---|---|
| `ledgerId` | 是 | 当前账本 |
| `granularity` | 趋势接口必填 | `DAY`、`WEEK`、`MONTH`、`YEAR` |
| `startAt` | 是 | 统计开始时间 |
| `endAt` | 是 | 统计结束时间 |

分类统计响应数据：

```json
[
  {
    "categoryId": "3",
    "categoryName": "餐饮",
    "amount": "42.00",
    "percentage": "25.00",
    "transactionCount": 1
  }
]
```

### 5. 预算

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/budgets?ledgerId=1&month=2026-07` | 查询总预算和分类预算执行情况 |
| `PUT` | `/budgets/monthly` | 创建或修改月总预算 |
| `PUT` | `/budgets/categories/{categoryId}` | 创建或修改分类预算 |
| `DELETE` | `/budgets/{id}?version=1` | 删除预算 |

预算金额、已使用金额和剩余额度均由后端计算，前端只负责展示。

创建时 `version` 传 `null`，修改时必须传当前版本。预算请求示例：

```json
{
  "ledgerId": "1",
  "month": "2026-07",
  "amount": "3000.00",
  "alertThreshold": "80.00",
  "enabled": true,
  "version": null
}
```

### 6. AI 授权与单次分析

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/ai/authorizations` | 查询 AI 数据授权范围 |
| `PUT` | `/ai/authorizations/{scope}` | 开启或撤销某项授权 |
| `POST` | `/ai/analyses/stream` | 发起页面内嵌 AI 单次分析 |

分析请求：

```http
POST /api/v1/ai/analyses/stream
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <access-token>
```

```json
{
  "requestId": "ai-analysis-20260713-001",
  "scene": "DAILY_DETAIL",
  "ledgerId": "1",
  "periodStart": "2026-07-13T00:00:00+08:00",
  "periodEnd": "2026-07-14T00:00:00+08:00",
  "question": "今天的消费有什么需要注意？"
}
```

前端不得上传完整账单数组。后端按当前用户、授权范围和时间区间查询数据，先执行确定性汇总，再把必要摘要发送给模型。模型原始输出不得直接返回；后端完成结构、证据、金额事实、内容安全和理财合规校验后，才允许发送结果。

## 四、SSE 事件协议

Web 端使用 `fetch()` 读取 `ReadableStream`，不能使用仅支持 GET 的原生 `EventSource`。微信小程序端需要单独验证分块响应能力，不支持时降级为普通 JSON。SSE 中的 `delta` 是对已校验完整结果的分块重放，不是上游模型 token。

### `meta`

```text
event: meta
data: {"analysisId":"1001","model":"configured-model","scene":"DAILY_DETAIL","status":"GENERATING"}
```

### `progress`

```text
event: progress
data: {"status":"VALIDATING"}
```

### `delta`

```text
event: delta
data: {"content":"今天餐饮支出42元"}
```

`delta` 只会在校验完成后出现。客户端不得把 `delta` 当作未经确认的模型原文。

### `result`

```text
event: result
data: {"summary":"餐饮占比较高","suggestions":["检查非必要外卖"],"riskNotice":null,"evidenceKeys":["daily.expense","category.food.ratio"],"validationStatus":"VALIDATED","validatorVersion":"v1","resultSource":"MODEL_VALIDATED"}
```

### `error`

```text
event: error
data: {"code":"MODEL_OUTPUT_INVALID","message":"模型结果未通过校验，已停止展示"}
```

### `done`

```text
event: done
data: {"status":"COMPLETED"}
```

`done.status` 可为 `COMPLETED`、`FALLBACK`、`REJECTED` 或 `CANCELLED`。`FALLBACK` 表示返回后端规则分析，`REJECTED` 表示模型输出被丢弃且没有可用兜底。

客户端断开连接后，服务端取消上游模型订阅，并把未完成记录标记为 `CANCELLED`。第一版不支持 SSE 断点续传。

## 五、P1/P2 后置接口

以下接口不进入第一轮核心记账开发：

```text
POST   /api/v1/ai/chat/sessions
GET    /api/v1/ai/chat/sessions
PUT    /api/v1/ai/chat/sessions/{id}
DELETE /api/v1/ai/chat/sessions/{id}
GET    /api/v1/ai/chat/sessions/{id}/messages
POST   /api/v1/ai/chat/stream
GET    /api/v1/ai/memories
PUT    /api/v1/ai/memories/{key}
DELETE /api/v1/ai/memories/{key}
GET    /api/v1/financial-products
GET    /api/v1/financial-products/{id}
GET    /api/v1/positions
```

长期记忆必须由用户显式开启，并支持查看、修改和物理删除；理财接口不得执行购买、赎回或资金转移。

## 六、错误码

| HTTP 状态 | 错误码 | 说明 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 参数格式或业务字段不正确 |
| 401 | `UNAUTHORIZED` | 未登录或令牌失效 |
| 401 | `INVALID_CREDENTIALS` | 用户名或密码错误 |
| 401 | `INVALID_REFRESH_TOKEN` | 刷新令牌无效、过期或已撤销 |
| 403 | `FORBIDDEN` | 没有资源访问权限 |
| 403 | `USER_DISABLED` | 用户账号不可用 |
| 404 | `NOT_FOUND` | 资源不存在或不属于当前用户 |
| 409 | `USERNAME_EXISTS` | 用户名已被使用 |
| 409 | `VERSION_CONFLICT` | 乐观锁版本冲突 |
| 409 | `BALANCE_UNCHANGED` | 余额校准目标与当前余额相同 |
| 409 | `CATEGORY_TYPE_CHANGE_NOT_ALLOWED` | 自定义分类创建后不能修改收支类型 |
| 409 | `DUPLICATE_REQUEST` | 幂等请求冲突 |
| 422 | `INSUFFICIENT_BALANCE` | 余额不足且账户不允许透支 |
| 400 | `TAGS_NOT_SUPPORTED` | 当前版本暂不支持写入账单标签 |
| 403 | `AI_NOT_AUTHORIZED` | 用户未授权 AI 读取对应数据 |
| 429 | `AI_RATE_LIMITED` | AI 分析触发频率过高 |
| 422 | `MODEL_OUTPUT_INVALID` | 模型输出结构、证据或事实未通过后端校验 |
| 422 | `MODEL_OUTPUT_UNSAFE` | 模型输出触发内容安全或理财合规规则 |
| 504 | `MODEL_TIMEOUT` | 上游模型调用超时 |
| 500 | `INTERNAL_ERROR` | 未公开的服务内部错误 |

## 七、实现状态

| 范围 | 状态 |
|---|---|
| WebFlux 工程与统一响应 | 已建立骨架 |
| 系统状态接口 | 已实现 |
| Reactive Security 与 JWT | 已实现；HS256、签发方校验、30 分钟访问令牌 |
| R2DBC 与 Flyway 配置 | 已建立；本地 MySQL 8 已完成 V1/V2/V3/V4 迁移验证 |
| 用户与认证 | 已实现注册、登录、刷新、退出和当前用户查询 |
| 注册默认数据 | 已实现默认账本及现金、微信、支付宝账户 |
| 账本与账户查询 | 已实现；按 JWT 当前用户隔离数据 |
| 收入/支出新增与流水列表 | 已实现；包含余额事务、幂等和基础筛选 |
| 账单详情、修改与删除 | 已实现；包含用户隔离、余额冲销、乐观锁和软删除 |
| 单流水双账户转账 | 已实现创建、查询、修改、删除、幂等和余额事务 |
| 账户写入 | 已实现新增、修改、停用和余额校准 |
| 自定义分类 | 已实现查询、新增、修改、删除和系统分类只读保护 |
| 日历、统计与预算 | 已实现月历、日周月年趋势与分类统计、总预算和分类预算 |
| AI 输出校验门 | 已实现结构、证据、金额事实、内容安全与理财合规校验 |
| AI 模型适配与 SSE | 待实现；必须复用校验门并只重放已校验结果 |
| 理财和 AI 多轮会话 | P1/P2 后置 |
