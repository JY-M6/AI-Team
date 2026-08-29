package com.qianji;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class QianjiApplicationTests {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DatabaseClient databaseClient;

    @Test
    void 应返回系统状态() {
        webTestClient.get()
                .uri("/api/v1/system/status")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.code").isEqualTo("OK")
                .jsonPath("$.data.service").isEqualTo("qianji-backend")
                .jsonPath("$.data.status").isEqualTo("UP");
    }

    @Test
    void 未认证用户不能访问业务接口() {
        webTestClient.get()
                .uri("/api/v1/ledgers")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void 应完成注册登录刷新和退出链路() throws Exception {
        JsonNode registered = postJson("/api/v1/auth/register", """
                {
                  "username": "qianji_test",
                  "password": "StrongPass123",
                  "nickname": "测试用户",
                  "deviceId": "test-device",
                  "deviceName": "测试浏览器"
                }
                """, 200);

        String userId = registered.path("data").path("user").path("id").asText();
        String accessToken = registered.path("data").path("accessToken").asText();
        String refreshToken = registered.path("data").path("refreshToken").asText();
        assertThat(accessToken).isNotBlank();
        assertThat(refreshToken).isNotBlank();

        webTestClient.get()
                .uri("/api/v1/users/me")
                .headers(headers -> headers.setBearerAuth(accessToken))
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.data.id").isEqualTo(userId)
                .jsonPath("$.data.nickname").isEqualTo("测试用户");

        assertThat(count("SELECT COUNT(*) FROM ledgers WHERE user_id = :userId", userId)).isEqualTo(1);
        assertThat(count("SELECT COUNT(*) FROM accounts WHERE user_id = :userId", userId)).isEqualTo(3);
        String passwordHash = databaseClient.sql("""
                        SELECT credential_hash FROM user_auths
                        WHERE user_id = :userId AND provider = 'USERNAME'
                        """)
                .bind("userId", Long.valueOf(userId))
                .map((row, metadata) -> row.get("credential_hash", String.class))
                .one()
                .block();
        assertThat(passwordHash).startsWith("$2").doesNotContain("StrongPass123");

        postJson("/api/v1/auth/register", """
                {
                  "username": "QIANJI_TEST",
                  "password": "AnotherPass123",
                  "nickname": "重复用户"
                }
                """, 409);

        postJson("/api/v1/auth/login", """
                {
                  "username": "qianji_test",
                  "password": "wrong-password"
                }
                """, 401);

        JsonNode loggedIn = postJson("/api/v1/auth/login", """
                {
                  "username": "QIANJI_TEST",
                  "password": "StrongPass123",
                  "deviceId": "second-device"
                }
                """, 200);
        assertThat(loggedIn.path("data").path("accessToken").asText()).isNotBlank();

        JsonNode refreshed = postJson("/api/v1/auth/refresh", """
                {"refreshToken": "%s"}
                """.formatted(refreshToken), 200);
        String rotatedAccessToken = refreshed.path("data").path("accessToken").asText();
        String rotatedRefreshToken = refreshed.path("data").path("refreshToken").asText();
        assertThat(rotatedRefreshToken).isNotEqualTo(refreshToken);

        postJson("/api/v1/auth/refresh", """
                {"refreshToken": "%s"}
                """.formatted(refreshToken), 401);

        webTestClient.post()
                .uri("/api/v1/auth/logout")
                .headers(headers -> headers.setBearerAuth(rotatedAccessToken))
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.code").isEqualTo("OK");

        postJson("/api/v1/auth/refresh", """
                {"refreshToken": "%s"}
                """.formatted(rotatedRefreshToken), 401);
    }

    @Test
    void 注册参数不合法时应返回明确错误() {
        webTestClient.post()
                .uri("/api/v1/auth/register")
                .header("Content-Type", "application/json")
                .bodyValue("""
                        {"username":"a","password":"123","nickname":""}
                        """)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.code").isEqualTo("VALIDATION_ERROR");
    }

    @Test
    void 登录后应只能查询自己的账本和账户() throws Exception {
        JsonNode first = postJson("/api/v1/auth/register", """
                {
                  "username": "ledger_owner_a",
                  "password": "StrongPass123",
                  "nickname": "账本用户甲"
                }
                """, 200);
        JsonNode second = postJson("/api/v1/auth/register", """
                {
                  "username": "ledger_owner_b",
                  "password": "StrongPass123",
                  "nickname": "账本用户乙"
                }
                """, 200);

        JsonNode firstLedgers = getJson("/api/v1/ledgers", first.path("data").path("accessToken").asText());
        JsonNode firstAccounts = getJson("/api/v1/accounts", first.path("data").path("accessToken").asText());
        JsonNode secondLedgers = getJson("/api/v1/ledgers", second.path("data").path("accessToken").asText());
        JsonNode secondAccounts = getJson("/api/v1/accounts", second.path("data").path("accessToken").asText());

        assertThat(firstLedgers.path("data")).hasSize(1);
        assertThat(firstLedgers.path("data").get(0).path("isDefault").asBoolean()).isTrue();
        assertThat(firstAccounts.path("data")).hasSize(3);
        assertThat(firstAccounts.path("data").findValuesAsText("name"))
                .containsExactly("现金", "微信", "支付宝");
        assertThat(ids(firstLedgers.path("data")))
                .doesNotContainAnyElementsOf(ids(secondLedgers.path("data")));
        assertThat(ids(firstAccounts.path("data")))
                .doesNotContainAnyElementsOf(ids(secondAccounts.path("data")));
    }

    @Test
    void 应新增收支更新余额并保证幂等和数据隔离() throws Exception {
        JsonNode owner = postJson("/api/v1/auth/register", """
                {
                  "username": "transaction_owner",
                  "password": "StrongPass123",
                  "nickname": "账单用户"
                }
                """, 200);
        String ownerToken = owner.path("data").path("accessToken").asText();
        String ledgerId = getJson("/api/v1/ledgers", ownerToken)
                .path("data").get(0).path("id").asText();
        String accountId = getJson("/api/v1/accounts", ownerToken)
                .path("data").get(0).path("id").asText();

        String incomeBody = """
                {
                  "requestId": "income-001",
                  "ledgerId": "%s",
                  "type": "INCOME",
                  "accountId": "%s",
                  "categoryId": "2",
                  "amount": "100.00",
                  "occurredAt": "2026-07-14T09:00:00+08:00",
                  "note": "工资入账",
                  "tagIds": []
                }
                """.formatted(ledgerId, accountId);
        JsonNode income = postJsonAuthenticated("/api/v1/transactions", incomeBody, ownerToken, 200);

        String expenseBody = """
                {
                  "requestId": "expense-001",
                  "ledgerId": "%s",
                  "type": "EXPENSE",
                  "accountId": "%s",
                  "categoryId": "1",
                  "amount": "42.00",
                  "occurredAt": "2026-07-14T12:18:00+08:00",
                  "note": "午餐套餐",
                  "tagIds": []
                }
                """.formatted(ledgerId, accountId);
        postJsonAuthenticated("/api/v1/transactions", expenseBody, ownerToken, 200);

        JsonNode accounts = getJson("/api/v1/accounts", ownerToken);
        JsonNode currentAccount = StreamSupport.stream(accounts.path("data").spliterator(), false)
                .filter(item -> accountId.equals(item.path("id").asText()))
                .findFirst()
                .orElseThrow();
        assertThat(currentAccount.path("balance").decimalValue()).isEqualByComparingTo("58.00");
        assertThat(currentAccount.path("version").asLong()).isEqualTo(2);

        JsonNode duplicate = postJsonAuthenticated("/api/v1/transactions", incomeBody, ownerToken, 200);
        assertThat(duplicate.path("data").path("id").asText())
                .isEqualTo(income.path("data").path("id").asText());
        assertThat(count("SELECT COUNT(*) FROM transactions WHERE user_id = :userId",
                owner.path("data").path("user").path("id").asText())).isEqualTo(2);

        JsonNode list = getJson("/api/v1/transactions?ledgerId=" + ledgerId + "&limit=20", ownerToken);
        assertThat(list.path("data")).hasSize(2);
        assertThat(list.path("data").get(0).path("type").asText()).isEqualTo("EXPENSE");
        assertThat(list.path("data").get(1).path("type").asText()).isEqualTo("INCOME");

        String insufficientBody = expenseBody
                .replace("expense-001", "expense-too-large")
                .replace("42.00", "1000.00");
        postJsonAuthenticated("/api/v1/transactions", insufficientBody, ownerToken, 422);
        assertThat(count("SELECT COUNT(*) FROM transactions WHERE user_id = :userId",
                owner.path("data").path("user").path("id").asText())).isEqualTo(2);

        JsonNode stranger = postJson("/api/v1/auth/register", """
                {
                  "username": "transaction_stranger",
                  "password": "StrongPass123",
                  "nickname": "其他用户"
                }
                """, 200);
        String strangerToken = stranger.path("data").path("accessToken").asText();
        String strangerLedgerId = getJson("/api/v1/ledgers", strangerToken)
                .path("data").get(0).path("id").asText();
        String strangerAccountId = getJson("/api/v1/accounts", strangerToken)
                .path("data").get(0).path("id").asText();
        String crossUserBody = incomeBody
                .replace("income-001", "cross-user-001")
                .replace("\"ledgerId\": \"%s\"".formatted(ledgerId),
                        "\"ledgerId\": \"%s\"".formatted(strangerLedgerId))
                .replace("\"accountId\": \"%s\"".formatted(accountId),
                        "\"accountId\": \"%s\"".formatted(strangerAccountId));
        postJsonAuthenticated("/api/v1/transactions", crossUserBody, ownerToken, 404);
    }

    @Test
    void 应查询修改删除账单并保持余额一致() throws Exception {
        JsonNode owner = postJson("/api/v1/auth/register", """
                {
                  "username": "transaction_crud_owner",
                  "password": "StrongPass123",
                  "nickname": "账单维护用户"
                }
                """, 200);
        String ownerToken = owner.path("data").path("accessToken").asText();
        String ledgerId = getJson("/api/v1/ledgers", ownerToken)
                .path("data").get(0).path("id").asText();
        JsonNode ownerAccounts = getJson("/api/v1/accounts", ownerToken).path("data");
        String firstAccountId = ownerAccounts.get(0).path("id").asText();
        String secondAccountId = ownerAccounts.get(1).path("id").asText();

        String incomeBody = """
                {
                  "requestId": "crud-income-001",
                  "ledgerId": "%s",
                  "type": "INCOME",
                  "accountId": "%s",
                  "categoryId": "2",
                  "amount": "200.00",
                  "occurredAt": "2026-07-14T08:30:00+08:00",
                  "note": "项目收入",
                  "tagIds": []
                }
                """.formatted(ledgerId, firstAccountId);
        JsonNode income = postJsonAuthenticated(
                "/api/v1/transactions", incomeBody, ownerToken, 200);
        String incomeId = income.path("data").path("id").asText();

        String expenseBody = """
                {
                  "requestId": "crud-expense-001",
                  "ledgerId": "%s",
                  "type": "EXPENSE",
                  "accountId": "%s",
                  "categoryId": "1",
                  "amount": "50.00",
                  "occurredAt": "2026-07-14T12:00:00+08:00",
                  "note": "午餐",
                  "tagIds": []
                }
                """.formatted(ledgerId, firstAccountId);
        JsonNode expense = postJsonAuthenticated(
                "/api/v1/transactions", expenseBody, ownerToken, 200);
        String expenseId = expense.path("data").path("id").asText();

        JsonNode detail = getJson("/api/v1/transactions/" + expenseId, ownerToken);
        assertThat(detail.path("data").path("note").asText()).isEqualTo("午餐");
        assertThat(detail.path("data").path("version").asLong()).isZero();

        String updateExpenseBody = """
                {
                  "ledgerId": "%s",
                  "type": "EXPENSE",
                  "accountId": "%s",
                  "categoryId": "1",
                  "amount": "80.00",
                  "occurredAt": "2026-07-14T12:20:00+08:00",
                  "note": "午餐和咖啡",
                  "tagIds": [],
                  "version": 0
                }
                """.formatted(ledgerId, firstAccountId);
        JsonNode updatedExpense = putJsonAuthenticated(
                "/api/v1/transactions/" + expenseId, updateExpenseBody, ownerToken, 200);
        assertThat(updatedExpense.path("data").path("amount").decimalValue())
                .isEqualByComparingTo("80.00");
        assertThat(updatedExpense.path("data").path("note").asText()).isEqualTo("午餐和咖啡");
        assertThat(updatedExpense.path("data").path("version").asLong()).isEqualTo(1);
        assertThat(accountBalance(ownerToken, firstAccountId)).isEqualByComparingTo("120.00");

        JsonNode staleUpdate = putJsonAuthenticated(
                "/api/v1/transactions/" + expenseId, updateExpenseBody, ownerToken, 409);
        assertThat(staleUpdate.path("code").asText()).isEqualTo("VERSION_CONFLICT");
        assertThat(accountBalance(ownerToken, firstAccountId)).isEqualByComparingTo("120.00");

        JsonNode rejectedDelete = deleteJsonAuthenticated(
                "/api/v1/transactions/" + incomeId + "?version=0", ownerToken, 422);
        assertThat(rejectedDelete.path("code").asText()).isEqualTo("INSUFFICIENT_BALANCE");
        assertThat(accountBalance(ownerToken, firstAccountId)).isEqualByComparingTo("120.00");

        deleteJsonAuthenticated(
                "/api/v1/transactions/" + expenseId + "?version=1", ownerToken, 200);
        assertThat(accountBalance(ownerToken, firstAccountId)).isEqualByComparingTo("200.00");
        getJsonAuthenticated("/api/v1/transactions/" + expenseId, ownerToken, 404);

        String moveIncomeBody = """
                {
                  "ledgerId": "%s",
                  "type": "INCOME",
                  "accountId": "%s",
                  "categoryId": "2",
                  "amount": "200.00",
                  "occurredAt": "2026-07-14T08:30:00+08:00",
                  "note": "项目收入转入微信",
                  "tagIds": [],
                  "version": 0
                }
                """.formatted(ledgerId, secondAccountId);
        JsonNode movedIncome = putJsonAuthenticated(
                "/api/v1/transactions/" + incomeId, moveIncomeBody, ownerToken, 200);
        assertThat(movedIncome.path("data").path("accountId").asText()).isEqualTo(secondAccountId);
        assertThat(movedIncome.path("data").path("version").asLong()).isEqualTo(1);
        assertThat(accountBalance(ownerToken, firstAccountId)).isEqualByComparingTo("0.00");
        assertThat(accountBalance(ownerToken, secondAccountId)).isEqualByComparingTo("200.00");

        JsonNode stranger = postJson("/api/v1/auth/register", """
                {
                  "username": "transaction_crud_stranger",
                  "password": "StrongPass123",
                  "nickname": "账单陌生用户"
                }
                """, 200);
        String strangerToken = stranger.path("data").path("accessToken").asText();
        getJsonAuthenticated("/api/v1/transactions/" + incomeId, strangerToken, 404);
        deleteJsonAuthenticated(
                "/api/v1/transactions/" + incomeId + "?version=1", strangerToken, 404);

        deleteJsonAuthenticated(
                "/api/v1/transactions/" + incomeId + "?version=1", ownerToken, 200);
        assertThat(accountBalance(ownerToken, secondAccountId)).isEqualByComparingTo("0.00");
        getJsonAuthenticated("/api/v1/transactions/" + incomeId, ownerToken, 404);

        String reusedIncomeBody = """
                {
                  "requestId": "crud-income-001",
                  "ledgerId": "%s",
                  "type": "INCOME",
                  "accountId": "%s",
                  "categoryId": "2",
                  "amount": "200.00",
                  "occurredAt": "2026-07-14T08:30:00+08:00",
                  "note": "重复请求",
                  "tagIds": []
                }
                """.formatted(ledgerId, secondAccountId);
        JsonNode reusedRequestId = postJsonAuthenticated(
                "/api/v1/transactions", reusedIncomeBody, ownerToken, 409);
        assertThat(reusedRequestId.path("code").asText()).isEqualTo("REQUEST_ID_REUSED");
        assertThat(accountBalance(ownerToken, secondAccountId)).isEqualByComparingTo("0.00");
    }

    @Test
    void 应使用单流水完成双账户转账并保证事务一致() throws Exception {
        JsonNode owner = postJson("/api/v1/auth/register", """
                {
                  "username": "transfer_owner",
                  "password": "StrongPass123",
                  "nickname": "转账用户"
                }
                """, 200);
        String ownerToken = owner.path("data").path("accessToken").asText();
        String ownerUserId = owner.path("data").path("user").path("id").asText();
        String ledgerId = getJson("/api/v1/ledgers", ownerToken)
                .path("data").get(0).path("id").asText();
        JsonNode accounts = getJson("/api/v1/accounts", ownerToken).path("data");
        String sourceAccountId = accounts.get(0).path("id").asText();
        String targetAccountId = accounts.get(1).path("id").asText();

        String seedIncomeBody = """
                {
                  "requestId": "transfer-seed-income",
                  "ledgerId": "%s",
                  "type": "INCOME",
                  "accountId": "%s",
                  "categoryId": "2",
                  "amount": "100.00",
                  "occurredAt": "2026-07-14T08:00:00+08:00",
                  "note": "转账测试入金",
                  "tagIds": []
                }
                """.formatted(ledgerId, sourceAccountId);
        postJsonAuthenticated("/api/v1/transactions", seedIncomeBody, ownerToken, 200);

        String transferBody = """
                {
                  "requestId": "transfer-001",
                  "ledgerId": "%s",
                  "type": "TRANSFER",
                  "accountId": "%s",
                  "targetAccountId": "%s",
                  "categoryId": null,
                  "amount": "30.00",
                  "occurredAt": "2026-07-14T09:30:00+08:00",
                  "note": "现金转入微信",
                  "tagIds": []
                }
                """.formatted(ledgerId, sourceAccountId, targetAccountId);
        JsonNode transfer = postJsonAuthenticated(
                "/api/v1/transactions", transferBody, ownerToken, 200);
        String transferId = transfer.path("data").path("id").asText();
        assertThat(transfer.path("data").path("type").asText()).isEqualTo("TRANSFER");
        assertThat(transfer.path("data").path("accountId").asText()).isEqualTo(sourceAccountId);
        assertThat(transfer.path("data").path("targetAccountId").asText()).isEqualTo(targetAccountId);
        assertThat(transfer.path("data").path("targetAccountName").asText()).isEqualTo("微信");
        assertThat(transfer.path("data").path("categoryId").isNull()).isTrue();
        assertThat(accountBalance(ownerToken, sourceAccountId)).isEqualByComparingTo("70.00");
        assertThat(accountBalance(ownerToken, targetAccountId)).isEqualByComparingTo("30.00");
        assertThat(count("SELECT COUNT(*) FROM transactions WHERE user_id = :userId", ownerUserId))
                .isEqualTo(2);

        JsonNode duplicate = postJsonAuthenticated(
                "/api/v1/transactions", transferBody, ownerToken, 200);
        assertThat(duplicate.path("data").path("id").asText()).isEqualTo(transferId);
        assertThat(accountBalance(ownerToken, sourceAccountId)).isEqualByComparingTo("70.00");
        assertThat(accountBalance(ownerToken, targetAccountId)).isEqualByComparingTo("30.00");

        JsonNode detail = getJson("/api/v1/transactions/" + transferId, ownerToken);
        assertThat(detail.path("data").path("targetAccountName").asText()).isEqualTo("微信");
        JsonNode transferList = getJson("/api/v1/transactions?type=TRANSFER&limit=20", ownerToken);
        assertThat(transferList.path("data")).hasSize(1);
        assertThat(transferList.path("data").get(0).path("targetAccountId").asText())
                .isEqualTo(targetAccountId);
        JsonNode targetAccountList = getJson(
                "/api/v1/transactions?accountId=" + targetAccountId + "&limit=20", ownerToken);
        assertThat(targetAccountList.path("data")).hasSize(1);
        assertThat(targetAccountList.path("data").get(0).path("id").asText()).isEqualTo(transferId);

        String sameAccountBody = transferBody
                .replace("transfer-001", "transfer-same-account")
                .replace("\"targetAccountId\": \"%s\"".formatted(targetAccountId),
                        "\"targetAccountId\": \"%s\"".formatted(sourceAccountId));
        JsonNode sameAccount = postJsonAuthenticated(
                "/api/v1/transactions", sameAccountBody, ownerToken, 400);
        assertThat(sameAccount.path("code").asText()).isEqualTo("VALIDATION_ERROR");

        String insufficientBody = transferBody
                .replace("transfer-001", "transfer-too-large")
                .replace("30.00", "1000.00");
        JsonNode insufficient = postJsonAuthenticated(
                "/api/v1/transactions", insufficientBody, ownerToken, 422);
        assertThat(insufficient.path("code").asText()).isEqualTo("INSUFFICIENT_BALANCE");
        assertThat(accountBalance(ownerToken, sourceAccountId)).isEqualByComparingTo("70.00");
        assertThat(accountBalance(ownerToken, targetAccountId)).isEqualByComparingTo("30.00");

        JsonNode stranger = postJson("/api/v1/auth/register", """
                {
                  "username": "transfer_stranger",
                  "password": "StrongPass123",
                  "nickname": "转账陌生用户"
                }
                """, 200);
        String strangerToken = stranger.path("data").path("accessToken").asText();
        String strangerAccountId = getJson("/api/v1/accounts", strangerToken)
                .path("data").get(0).path("id").asText();
        String crossUserBody = """
                {
                  "requestId": "transfer-cross-user",
                  "ledgerId": "%s",
                  "type": "TRANSFER",
                  "accountId": "%s",
                  "targetAccountId": "%s",
                  "categoryId": null,
                  "amount": "10.00",
                  "occurredAt": "2026-07-14T10:00:00+08:00",
                  "note": "越权转账",
                  "tagIds": []
                }
                """.formatted(ledgerId, sourceAccountId, strangerAccountId);
        postJsonAuthenticated("/api/v1/transactions", crossUserBody, ownerToken, 404);
        assertThat(accountBalance(ownerToken, sourceAccountId)).isEqualByComparingTo("70.00");
        assertThat(accountBalance(ownerToken, targetAccountId)).isEqualByComparingTo("30.00");

        String updateTransferBody = """
                {
                  "ledgerId": "%s",
                  "type": "TRANSFER",
                  "accountId": "%s",
                  "targetAccountId": "%s",
                  "categoryId": null,
                  "amount": "20.00",
                  "occurredAt": "2026-07-14T09:45:00+08:00",
                  "note": "调整转账金额",
                  "tagIds": [],
                  "version": 0
                }
                """.formatted(ledgerId, sourceAccountId, targetAccountId);
        JsonNode updatedTransfer = putJsonAuthenticated(
                "/api/v1/transactions/" + transferId, updateTransferBody, ownerToken, 200);
        assertThat(updatedTransfer.path("data").path("amount").decimalValue())
                .isEqualByComparingTo("20.00");
        assertThat(accountBalance(ownerToken, sourceAccountId)).isEqualByComparingTo("80.00");
        assertThat(accountBalance(ownerToken, targetAccountId)).isEqualByComparingTo("20.00");

        deleteJsonAuthenticated(
                "/api/v1/transactions/" + transferId + "?version=1", ownerToken, 200);
        assertThat(accountBalance(ownerToken, sourceAccountId)).isEqualByComparingTo("100.00");
        assertThat(accountBalance(ownerToken, targetAccountId)).isEqualByComparingTo("0.00");
        getJsonAuthenticated("/api/v1/transactions/" + transferId, ownerToken, 404);
    }

    @Test
    void 应完成账户管理和余额校准闭环() throws Exception {
        JsonNode registered = postJson("/api/v1/auth/register", """
                {
                  "username": "p0_account_owner",
                  "password": "StrongPass123",
                  "nickname": "账户管理用户"
                }
                """, 200);
        String token = registered.path("data").path("accessToken").asText();
        String userId = registered.path("data").path("user").path("id").asText();
        String ledgerId = getJson("/api/v1/ledgers", token)
                .path("data").get(0).path("id").asText();

        JsonNode created = postJsonAuthenticated("/api/v1/accounts", """
                {
                  "ledgerId": "%s",
                  "name": "工资卡",
                  "type": "BANK_CARD",
                  "currency": "CNY"
                }
                """.formatted(ledgerId), token, 200);
        String accountId = created.path("data").path("id").asText();

        String adjustment = """
                {
                  "requestId": "balance-adjust-001",
                  "targetBalance": "120.00",
                  "occurredAt": "2026-07-14T12:00:00+08:00",
                  "note": "首次余额校准",
                  "version": 0
                }
                """;
        JsonNode adjusted = postJsonAuthenticated(
                "/api/v1/accounts/" + accountId + "/balance-adjustments",
                adjustment, token, 200);
        assertThat(adjusted.path("data").path("balance").decimalValue())
                .isEqualByComparingTo("120.00");
        postJsonAuthenticated(
                "/api/v1/accounts/" + accountId + "/balance-adjustments",
                adjustment, token, 200);
        assertThat(count("""
                SELECT COUNT(*) FROM transactions
                WHERE user_id = :userId AND type = 'ADJUSTMENT'
                """, userId)).isEqualTo(1);
        BigDecimal adjustmentDelta = databaseClient.sql("""
                        SELECT balance_delta FROM transactions
                        WHERE user_id = :userId AND request_id = 'balance-adjust-001'
                        """)
                .bind("userId", Long.valueOf(userId))
                .map((row, metadata) -> row.get("balance_delta", BigDecimal.class))
                .one().block();
        assertThat(adjustmentDelta).isEqualByComparingTo("120.00");

        JsonNode renamed = putJsonAuthenticated("/api/v1/accounts/" + accountId, """
                {
                  "name": "主工资卡",
                  "type": "BANK_CARD",
                  "version": 1
                }
                """, token, 200);
        assertThat(renamed.path("data").path("version").asLong()).isEqualTo(2);
        JsonNode nonZeroDelete = deleteJsonAuthenticated(
                "/api/v1/accounts/" + accountId + "?version=2", token, 409);
        assertThat(nonZeroDelete.path("code").asText()).isEqualTo("ACCOUNT_BALANCE_NOT_ZERO");

        postJsonAuthenticated(
                "/api/v1/accounts/" + accountId + "/balance-adjustments", """
                {
                  "requestId": "balance-adjust-002",
                  "targetBalance": "0.00",
                  "occurredAt": "2026-07-14T13:00:00+08:00",
                  "note": "账户停用前归零",
                  "version": 2
                }
                """, token, 200);
        deleteJsonAuthenticated("/api/v1/accounts/" + accountId + "?version=3", token, 200);
        assertThat(ids(getJson("/api/v1/accounts", token).path("data"))).doesNotContain(accountId);
    }

    @Test
    void 应管理自定义分类并保护系统分类和用户边界() throws Exception {
        JsonNode owner = postJson("/api/v1/auth/register", """
                {
                  "username": "p0_category_owner",
                  "password": "StrongPass123",
                  "nickname": "分类用户"
                }
                """, 200);
        String ownerToken = owner.path("data").path("accessToken").asText();
        JsonNode systemCategories = getJson("/api/v1/categories?type=EXPENSE", ownerToken);
        String systemCategoryId = systemCategories.path("data").get(0).path("id").asText();
        assertThat(systemCategories.path("data").get(0).path("system").asBoolean()).isTrue();

        JsonNode created = postJsonAuthenticated("/api/v1/categories", """
                {
                  "type": "EXPENSE",
                  "name": "宠物",
                  "icon": "paw-print",
                  "color": "#45D483",
                  "sortOrder": 90
                }
                """, ownerToken, 200);
        String categoryId = created.path("data").path("id").asText();
        JsonNode updated = putJsonAuthenticated("/api/v1/categories/" + categoryId, """
                {
                  "type": "EXPENSE",
                  "name": "宠物用品",
                  "icon": "paw-print",
                  "color": "#45D483",
                  "sortOrder": 91
                }
                """, ownerToken, 200);
        assertThat(updated.path("data").path("name").asText()).isEqualTo("宠物用品");
        deleteJsonAuthenticated("/api/v1/categories/" + systemCategoryId, ownerToken, 404);

        JsonNode stranger = postJson("/api/v1/auth/register", """
                {
                  "username": "p0_category_stranger",
                  "password": "StrongPass123",
                  "nickname": "其他分类用户"
                }
                """, 200);
        String strangerToken = stranger.path("data").path("accessToken").asText();
        putJsonAuthenticated("/api/v1/categories/" + categoryId, """
                {
                  "type": "EXPENSE",
                  "name": "越权修改",
                  "icon": "x",
                  "color": "#FF0000",
                  "sortOrder": 1
                }
                """, strangerToken, 404);
        deleteJsonAuthenticated("/api/v1/categories/" + categoryId, ownerToken, 200);
        assertThat(ids(getJson("/api/v1/categories?type=EXPENSE", ownerToken).path("data")))
                .doesNotContain(categoryId);
    }

    @Test
    void 应由同一批流水驱动统计日历和预算() throws Exception {
        JsonNode registered = postJson("/api/v1/auth/register", """
                {
                  "username": "p0_report_owner",
                  "password": "StrongPass123",
                  "nickname": "统计用户"
                }
                """, 200);
        String token = registered.path("data").path("accessToken").asText();
        String ledgerId = getJson("/api/v1/ledgers", token)
                .path("data").get(0).path("id").asText();
        String accountId = getJson("/api/v1/accounts", token)
                .path("data").get(0).path("id").asText();

        postJsonAuthenticated("/api/v1/transactions", """
                {
                  "requestId": "report-income-001",
                  "ledgerId": "%s",
                  "type": "INCOME",
                  "accountId": "%s",
                  "categoryId": "2",
                  "amount": "1000.00",
                  "occurredAt": "2026-07-02T09:00:00+08:00",
                  "note": "工资",
                  "tagIds": []
                }
                """.formatted(ledgerId, accountId), token, 200);
        postJsonAuthenticated("/api/v1/transactions", """
                {
                  "requestId": "report-expense-001",
                  "ledgerId": "%s",
                  "type": "EXPENSE",
                  "accountId": "%s",
                  "categoryId": "1",
                  "amount": "100.00",
                  "occurredAt": "2026-07-08T12:00:00+08:00",
                  "note": "餐饮",
                  "tagIds": []
                }
                """.formatted(ledgerId, accountId), token, 200);

        String range = "&startAt=2026-06-30T16:00:00Z&endAt=2026-07-31T16:00:00Z";
        JsonNode summary = getJson(
                "/api/v1/reports/summary?ledgerId=" + ledgerId + range, token);
        assertThat(summary.path("data").path("income").decimalValue())
                .isEqualByComparingTo("1000.00");
        assertThat(summary.path("data").path("expense").decimalValue())
                .isEqualByComparingTo("100.00");
        for (String granularity : Set.of("DAY", "WEEK", "MONTH", "YEAR")) {
            JsonNode trend = getJson(
                    "/api/v1/reports/trend?ledgerId=" + ledgerId
                            + "&granularity=" + granularity + range,
                    token);
            assertThat(trend.path("data").isArray()).isTrue();
            assertThat(trend.path("data").size()).isGreaterThanOrEqualTo(1);
        }
        JsonNode categories = getJson(
                "/api/v1/reports/categories?ledgerId=" + ledgerId
                        + "&type=EXPENSE" + range,
                token);
        assertThat(categories.path("data").get(0).path("categoryName").asText()).isEqualTo("餐饮");
        assertThat(categories.path("data").get(0).path("percentage").decimalValue())
                .isEqualByComparingTo("100.00");
        JsonNode calendar = getJson(
                "/api/v1/calendar/monthly?ledgerId=" + ledgerId + "&month=2026-07", token);
        assertThat(calendar.path("data").path("days")).hasSize(2);

        JsonNode monthlyBudget = putJsonAuthenticated("/api/v1/budgets/monthly", """
                {
                  "ledgerId": "%s",
                  "month": "2026-07",
                  "amount": "500.00",
                  "alertThreshold": "80.00",
                  "enabled": true,
                  "version": null
                }
                """.formatted(ledgerId), token, 200);
        assertThat(monthlyBudget.path("data").path("used").decimalValue())
                .isEqualByComparingTo("100.00");
        assertThat(monthlyBudget.path("data").path("usagePercentage").decimalValue())
                .isEqualByComparingTo("20.00");

        JsonNode categoryBudget = putJsonAuthenticated("/api/v1/budgets/categories/1", """
                {
                  "ledgerId": "%s",
                  "month": "2026-07",
                  "amount": "200.00",
                  "alertThreshold": "50.00",
                  "enabled": true,
                  "version": null
                }
                """.formatted(ledgerId), token, 200);
        assertThat(categoryBudget.path("data").path("alertReached").asBoolean()).isTrue();
        putJsonAuthenticated("/api/v1/budgets/monthly", """
                {
                  "ledgerId": "%s",
                  "month": "2026-07",
                  "amount": "600.00",
                  "alertThreshold": "80.00",
                  "enabled": true,
                  "version": 0
                }
                """.formatted(ledgerId), token, 200);
        putJsonAuthenticated("/api/v1/budgets/monthly", """
                {
                  "ledgerId": "%s",
                  "month": "2026-07",
                  "amount": "700.00",
                  "alertThreshold": "80.00",
                  "enabled": true,
                  "version": 0
                }
                """.formatted(ledgerId), token, 409);
        JsonNode budgets = getJson(
                "/api/v1/budgets?ledgerId=" + ledgerId + "&month=2026-07", token);
        assertThat(budgets.path("data")).hasSize(2);
    }

    private JsonNode postJson(String uri, String body, int expectedStatus) throws Exception {
        byte[] response = webTestClient.post()
                .uri(uri)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .exchange()
                .expectStatus().isEqualTo(expectedStatus)
                .expectBody()
                .returnResult()
                .getResponseBody();
        assertThat(response).isNotNull();
        return objectMapper.readTree(new String(response, StandardCharsets.UTF_8));
    }

    private JsonNode getJson(String uri, String accessToken) throws Exception {
        return getJsonAuthenticated(uri, accessToken, 200);
    }

    private JsonNode getJsonAuthenticated(
            String uri,
            String accessToken,
            int expectedStatus
    ) throws Exception {
        byte[] response = webTestClient.get()
                .uri(uri)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .exchange()
                .expectStatus().isEqualTo(expectedStatus)
                .expectBody()
                .returnResult()
                .getResponseBody();
        assertThat(response).isNotNull();
        return objectMapper.readTree(new String(response, StandardCharsets.UTF_8));
    }

    private JsonNode putJsonAuthenticated(
            String uri,
            String body,
            String accessToken,
            int expectedStatus
    ) throws Exception {
        byte[] response = webTestClient.put()
                .uri(uri)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .exchange()
                .expectStatus().isEqualTo(expectedStatus)
                .expectBody()
                .returnResult()
                .getResponseBody();
        assertThat(response).isNotNull();
        return objectMapper.readTree(new String(response, StandardCharsets.UTF_8));
    }

    private JsonNode deleteJsonAuthenticated(
            String uri,
            String accessToken,
            int expectedStatus
    ) throws Exception {
        byte[] response = webTestClient.delete()
                .uri(uri)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .exchange()
                .expectStatus().isEqualTo(expectedStatus)
                .expectBody()
                .returnResult()
                .getResponseBody();
        assertThat(response).isNotNull();
        return objectMapper.readTree(new String(response, StandardCharsets.UTF_8));
    }

    private JsonNode postJsonAuthenticated(
            String uri,
            String body,
            String accessToken,
            int expectedStatus
    ) throws Exception {
        byte[] response = webTestClient.post()
                .uri(uri)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .exchange()
                .expectStatus().isEqualTo(expectedStatus)
                .expectBody()
                .returnResult()
                .getResponseBody();
        assertThat(response).isNotNull();
        return objectMapper.readTree(new String(response, StandardCharsets.UTF_8));
    }

    private Set<String> ids(JsonNode array) {
        return StreamSupport.stream(array.spliterator(), false)
                .map(item -> item.path("id").asText())
                .collect(Collectors.toSet());
    }

    private long count(String sql, String userId) {
        Number result = databaseClient.sql(sql)
                .bind("userId", Long.valueOf(userId))
                .map((row, metadata) -> row.get(0, Number.class))
                .one()
                .block();
        return result == null ? 0 : result.longValue();
    }

    private java.math.BigDecimal accountBalance(String accessToken, String accountId) throws Exception {
        JsonNode accounts = getJson("/api/v1/accounts", accessToken).path("data");
        return StreamSupport.stream(accounts.spliterator(), false)
                .filter(item -> accountId.equals(item.path("id").asText()))
                .findFirst()
                .orElseThrow()
                .path("balance")
                .decimalValue();
    }
}
