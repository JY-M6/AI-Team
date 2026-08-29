package com.qianji.ledger;

import com.qianji.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    Mono<ApiResponse<TransactionResponse>> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        return transactionService.create(Long.valueOf(jwt.getSubject()), request).map(ApiResponse::success);
    }

    @GetMapping
    Mono<ApiResponse<List<TransactionResponse>>> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long ledgerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime startAt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime endAt,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long accountId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return transactionService.findAll(
                        Long.valueOf(jwt.getSubject()),
                        ledgerId,
                        startAt,
                        endAt,
                        type,
                        categoryId,
                        accountId,
                        limit
                )
                .collectList()
                .map(ApiResponse::success);
    }

    @GetMapping("/{id}")
    Mono<ApiResponse<TransactionResponse>> findOne(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        return transactionService.findOne(Long.valueOf(jwt.getSubject()), id).map(ApiResponse::success);
    }

    @PutMapping("/{id}")
    Mono<ApiResponse<TransactionResponse>> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransactionRequest request
    ) {
        return transactionService.update(Long.valueOf(jwt.getSubject()), id, request).map(ApiResponse::success);
    }

    @DeleteMapping("/{id}")
    Mono<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestParam long version
    ) {
        return transactionService.delete(Long.valueOf(jwt.getSubject()), id, version)
                .thenReturn(ApiResponse.success(null));
    }
}
