package com.qianji.ledger;

import com.qianji.common.api.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
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

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    Mono<ApiResponse<List<CategoryResponse>>> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam
            @Pattern(regexp = "EXPENSE|INCOME", message = "当前只支持EXPENSE或INCOME")
            String type
    ) {
        return categoryService.findAll(Long.valueOf(jwt.getSubject()), type)
                .collectList()
                .map(ApiResponse::success);
    }

    @PostMapping
    Mono<ApiResponse<CategoryResponse>> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return categoryService.create(Long.valueOf(jwt.getSubject()), request)
                .map(ApiResponse::success);
    }

    @PutMapping("/{id}")
    Mono<ApiResponse<CategoryResponse>> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request
    ) {
        return categoryService.update(Long.valueOf(jwt.getSubject()), id, request)
                .map(ApiResponse::success);
    }

    @DeleteMapping("/{id}")
    Mono<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        return categoryService.delete(Long.valueOf(jwt.getSubject()), id)
                .thenReturn(ApiResponse.success(null));
    }
}
