package com.qianji.ledger;

import com.qianji.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    Mono<ApiResponse<AccountResponse>> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateAccountRequest request
    ) {
        return accountService.create(Long.valueOf(jwt.getSubject()), request).map(ApiResponse::success);
    }

    @PutMapping("/{id}")
    Mono<ApiResponse<AccountResponse>> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAccountRequest request
    ) {
        return accountService.update(Long.valueOf(jwt.getSubject()), id, request).map(ApiResponse::success);
    }

    @DeleteMapping("/{id}")
    Mono<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestParam long version
    ) {
        return accountService.delete(Long.valueOf(jwt.getSubject()), id, version)
                .thenReturn(ApiResponse.success(null));
    }

    @PostMapping("/{id}/balance-adjustments")
    Mono<ApiResponse<AccountResponse>> adjustBalance(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody BalanceAdjustmentRequest request
    ) {
        return accountService.adjustBalance(Long.valueOf(jwt.getSubject()), id, request)
                .map(ApiResponse::success);
    }
}
