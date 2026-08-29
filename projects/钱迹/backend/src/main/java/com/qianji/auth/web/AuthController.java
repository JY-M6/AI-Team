package com.qianji.auth.web;

import com.qianji.auth.dto.AuthTokenResponse;
import com.qianji.auth.dto.LoginRequest;
import com.qianji.auth.dto.RefreshTokenRequest;
import com.qianji.auth.dto.RegisterRequest;
import com.qianji.auth.service.AuthService;
import com.qianji.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    Mono<ApiResponse<AuthTokenResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request).map(ApiResponse::success);
    }

    @PostMapping("/login")
    Mono<ApiResponse<AuthTokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request).map(ApiResponse::success);
    }

    @PostMapping("/refresh")
    Mono<ApiResponse<AuthTokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request).map(ApiResponse::success);
    }

    @PostMapping("/logout")
    Mono<ApiResponse<Void>> logout(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        Number sessionClaim = jwt.getClaim("sid");
        Long sessionId = sessionClaim.longValue();
        return authService.logout(userId, sessionId).thenReturn(ApiResponse.success(null));
    }
}
