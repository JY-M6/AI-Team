package com.qianji.budget;

import com.qianji.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    Mono<ApiResponse<List<BudgetResponse>>> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long ledgerId,
            @RequestParam String month
    ) {
        return budgetService.findAll(Long.valueOf(jwt.getSubject()), ledgerId, month)
                .collectList()
                .map(ApiResponse::success);
    }

    @PutMapping("/monthly")
    Mono<ApiResponse<BudgetResponse>> saveMonthly(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody BudgetRequest request
    ) {
        return budgetService.save(Long.valueOf(jwt.getSubject()), null, request)
                .map(ApiResponse::success);
    }

    @PutMapping("/categories/{categoryId}")
    Mono<ApiResponse<BudgetResponse>> saveCategory(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long categoryId,
            @Valid @RequestBody BudgetRequest request
    ) {
        return budgetService.save(Long.valueOf(jwt.getSubject()), categoryId, request)
                .map(ApiResponse::success);
    }

    @DeleteMapping("/{id}")
    Mono<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestParam long version
    ) {
        return budgetService.delete(Long.valueOf(jwt.getSubject()), id, version)
                .thenReturn(ApiResponse.success(null));
    }
}
