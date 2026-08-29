package com.qianji.ledger;

import com.qianji.common.api.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class LedgerController {

    private final LedgerQueryService ledgerQueryService;

    public LedgerController(LedgerQueryService ledgerQueryService) {
        this.ledgerQueryService = ledgerQueryService;
    }

    @GetMapping("/ledgers")
    Mono<ApiResponse<List<LedgerResponse>>> ledgers(@AuthenticationPrincipal Jwt jwt) {
        return ledgerQueryService.findLedgers(Long.valueOf(jwt.getSubject())).map(ApiResponse::success);
    }

    @GetMapping("/accounts")
    Mono<ApiResponse<List<AccountResponse>>> accounts(@AuthenticationPrincipal Jwt jwt) {
        return ledgerQueryService.findAccounts(Long.valueOf(jwt.getSubject())).map(ApiResponse::success);
    }
}
